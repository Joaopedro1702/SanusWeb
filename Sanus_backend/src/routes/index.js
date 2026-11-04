const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { jwtSecret, mpPublicKey, publicBaseUrl } = require('../config');
const criarCtl = require("../controllers/criarController.js");
const consultar = require("../controllers/consultarController.js");
const atualizarCtl = require ("../controllers/atualizarController.js");
const apagar = require("../controllers/apagarController.js");
const dashboardController = require("../controllers/dashboardController.js") 
const usuarioRepo = require("../repositories/usuarioRepository.js");
const { autenticar } = require("../middleware/auth.js");
const usuario = require("../repositories/usuarioRepository");
const validarCpf = require("../middleware/validaCpf.js");
const db = require("../connection/db.js");
const crypto = require("crypto");
const {
  criarClientesMercadoPago,
  WebhookSignatureValidator,
} = require("../services/mercadoPago.js");
//login

router.post("/login", async (req, res) => {
    try{
        const {email, senha} = req.body;
        const usuario = await usuarioRepo.buscarUsuarioPorEmail({email});
        const ok = usuario && await bcrypt.compare(senha, usuario.senha);
        if (!ok) return res.status(401).json({error: "Credenciais inválidas!"});
        
        const token = jwt.sign({id: usuario.id}, jwtSecret, {expiresIn: "8h"});
        res.json({token, id:usuario.id, nome: usuario.nome})
    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
});


router.post("/usuarios",validarCpf , criarCtl(usuario.criarUsuario));

router.get("/pagamentos/config", (req, res) => {
  if (!mpPublicKey) {
    return res.status(503).json({ error: "Chave pública do Mercado Pago não configurada." });
  }
  return res.json({ publicKey: mpPublicKey });
});

router.post("/pagamentos/webhook", async (req,res) => {
  try{
    const paymentId = String(req.query["data.id"] || req.body?.data?.id || "");
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!paymentId || !secret){
      return res.sendStatus(secret ? 400 : 503);
    }
    try {
      WebhookSignatureValidator.validate({
        xSignature: req.headers["x-signature"],
        xRequestId: req.headers["x-request-id"],
        dataId: paymentId,
        secret,
        toleranceSeconds: 300,
      });
    } catch (error) {
      console.warn("Assinatura de webhook Mercado Pago inválida:", error.message);
      return res.sendStatus(401);
    }
      // Consulte o pagamento na API; não confie no status informado pelo navegador.
      const { payment } = criarClientesMercadoPago();
      const pagamento = await payment.get({ id: paymentId });
      const referencia = pagamento.external_reference;
      if (!referencia) return res.sendStatus(200);

      const [pedidos] = await db.query(
        "SELECT id, valor, mp_payment_id FROM Tbl_Pedido_Online WHERE referencia = ? LIMIT 1",
        [referencia],
      );
      const pedido = pedidos[0];
      // Eventos de pagamentos que não pertencem a um pedido Sanus são ignorados.
      if (!pedido) return res.sendStatus(200);

      const valorPago = Number(pagamento.transaction_amount);
      if (
        String(pagamento.currency_id) !== "BRL" ||
        Math.round(valorPago * 100) !== Math.round(Number(pedido.valor) * 100)
      ) {
        console.error("Pagamento Mercado Pago diverge do pedido", referencia);
        return res.sendStatus(200);
      }

      const estadosPermitidos = new Set([
        "approved", "pending", "in_process", "rejected", "cancelled", "refunded", "charged_back",
      ]);
      const status = estadosPermitidos.has(pagamento.status) ? pagamento.status : "pending";
      await db.query(
        `UPDATE Tbl_Pedido_Online
         SET status = ?, mp_payment_id = ?, forma_pagamento = ?, atualizado_em = CURRENT_TIMESTAMP
         WHERE referencia = ? AND (mp_payment_id IS NULL OR mp_payment_id = ?)`,
        [status, String(pagamento.id), pagamento.payment_method_id || null, referencia, String(pagamento.id)],
      );
      return res.sendStatus(200);
  }catch(error){
    console.error("Erro ao processar webhook Mercado Pago:", error.message);
    return res.sendStatus(error.status || 500);
  }
});
//autenticar token

router.use(autenticar)

//Registra as quatro rotas do CRUD em uma entidade

function crud(caminho, { criar, buscar, listar, atualizar: upd, deletar }) {
  if (criar)   router.post(`/${caminho}`, criarCtl(criar));
  if (listar)  router.get(`/${caminho}`, consultar(listar));
  if (buscar)  router.get(`/${caminho}/:id`, consultar(buscar));
  if (upd)     router.put(`/${caminho}/:id`, atualizarCtl(upd));
  if (deletar) router.delete(`/${caminho}/:id`, apagar(deletar));
}

crud("usuarios", {
  buscar: usuario.buscarUsuarioPorId,
  atualizar: usuario.atualizarUsuario,
  deletar: usuario.deletarUsuario,
});

const cliente = require("../repositories/clienteRepository");
crud("clientes", {
  criar: cliente.criarCliente,
  buscar: cliente.buscarClientePorId,
  listar: cliente.listarClientes,
  atualizar: cliente.atualizarCliente,
  deletar: cliente.deletarCliente,
});

const produto = require("../repositories/produtoRepository");
crud("produtos", {
  criar: produto.cadastroProduto,
  buscar: produto.listaProdutosPorId,
  listar: produto.listarProdutos,
  atualizar: produto.atualizarProduto,
  deletar: produto.deletarProduto,
});

const venda = require("../repositories/vendaRepository");
router.get("/vendas/:id", consultar(venda.buscarVendaPorId));

const pagamentoVenda = require("../repositories/pagamentoVendaRepository");
router.get("/pagamentos-venda/:id", consultar(pagamentoVenda.buscarPagamentoVendaPorId));

async function criarPedidoOnline(idUsuario, itensSolicitados) {
  if (!Array.isArray(itensSolicitados) || itensSolicitados.length === 0 || itensSolicitados.length > 100) {
    const error = new Error("Carrinho vazio ou inválido.");
    error.status = 400;
    throw error;
  }

  const [[cliente]] = await db.query(
    `SELECT c.id, u.email, u.cpf
     FROM Tbl_Cliente c
     JOIN Tbl_Usuario u ON u.id = c.id_Usuario
     WHERE c.id_Usuario = ? LIMIT 1`,
    [idUsuario],
  );
  if (!cliente) {
    const error = new Error("Sua conta não está vinculada a um cliente.");
    error.status = 403;
    throw error;
  }

  const itensAgrupados = new Map();
  for (const item of itensSolicitados) {
    const produtoId = Number(item?.produtoId);
    const quantidade = Number(item?.quantidade);
    if (!Number.isSafeInteger(produtoId) || produtoId <= 0 || !Number.isSafeInteger(quantidade) || quantidade <= 0) {
      const error = new Error("Produto ou quantidade inválidos.");
      error.status = 400;
      throw error;
    }
    itensAgrupados.set(produtoId, (itensAgrupados.get(produtoId) || 0) + quantidade);
  }

  const ids = [...itensAgrupados.keys()];
  const placeholders = ids.map(() => "?").join(",");
  const [produtos] = await db.query(
    `SELECT id, nome, preco FROM Tbl_Produto WHERE id IN (${placeholders})`,
    ids,
  );
  if (produtos.length !== ids.length) {
    const error = new Error("Um ou mais produtos não foram encontrados.");
    error.status = 400;
    throw error;
  }

  const produtosPorId = new Map(produtos.map((produto) => [Number(produto.id), produto]));
  const itens = ids.map((produtoId) => {
    const produto = produtosPorId.get(produtoId);
    return {
      id: String(produto.id),
      title: produto.nome,
      quantity: itensAgrupados.get(produtoId),
      unit_price: Number(produto.preco),
      currency_id: "BRL",
    };
  });
  const valor = Math.round(itens.reduce((total, item) => total + item.quantity * item.unit_price, 0) * 100) / 100;
  const referencia = crypto.randomUUID();

  await db.query(
    `INSERT INTO Tbl_Pedido_Online (referencia, id_Cliente, itens, valor, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [referencia, cliente.id, JSON.stringify(itens), valor],
  );

  return { cliente, itens, valor, referencia };
}

router.post("/pagamentos", async (req, res) => {
  let pedido;
  try {
    const tipo = req.body?.tipo;
    if (!["pix", "cartao"].includes(tipo)) {
      return res.status(400).json({ error: "Forma de pagamento inválida." });
    }

    const dadosCartao = req.body?.cartao || {};
    if (tipo === "cartao") {
      const installments = Number(dadosCartao.installments);
      if (!dadosCartao.token || !dadosCartao.payment_method_id || !Number.isSafeInteger(installments) || installments < 1) {
        return res.status(400).json({ error: "Dados do cartão inválidos." });
      }
    }

    pedido = await criarPedidoOnline(req.usuario.id, req.body?.itens);
    const { payment } = criarClientesMercadoPago();
    const corpo = {
      transaction_amount: pedido.valor,
      description: `Pedido SANUS ${pedido.referencia}`,
      external_reference: pedido.referencia,
      notification_url: `${publicBaseUrl.replace(/\/$/, "")}/api/pagamentos/webhook`,
      payer: {
        email: pedido.cliente.email,
        identification: { type: "CPF", number: pedido.cliente.cpf },
      },
    };

    if (tipo === "pix") {
      corpo.payment_method_id = "pix";
    } else {
      const installments = Number(dadosCartao.installments);
      corpo.token = dadosCartao.token;
      corpo.payment_method_id = dadosCartao.payment_method_id;
      corpo.installments = installments;
      const issuerId = Number(dadosCartao.issuer_id);
      if (Number.isSafeInteger(issuerId) && issuerId > 0) corpo.issuer_id = issuerId;
    }

    const pagamento = await payment.create({
      body: corpo,
      requestOptions: { idempotencyKey: pedido.referencia },
    });

    await db.query(
      `UPDATE Tbl_Pedido_Online
       SET status = ?, mp_payment_id = ?, forma_pagamento = ?
       WHERE referencia = ?`,
      [pagamento.status || "pending", String(pagamento.id), pagamento.payment_method_id || tipo, pedido.referencia],
    );

    const transactionData = pagamento.point_of_interaction?.transaction_data || {};
    return res.status(201).json({
      referencia: pedido.referencia,
      status: pagamento.status,
      statusDetail: pagamento.status_detail,
      qrCode: transactionData.qr_code || null,
      qrCodeBase64: transactionData.qr_code_base64 || null,
      ticketUrl: transactionData.ticket_url || null,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    if (pedido?.referencia) {
      await db.query(
        "UPDATE Tbl_Pedido_Online SET status = 'payment_error' WHERE referencia = ? AND status = 'pending'",
        [pedido.referencia],
      ).catch((dbError) => console.error("Erro ao atualizar pedido com falha:", dbError));
    }
    return res.status(error.status || 500).json({ error: error.status === 503 ? error.message : "Não foi possível processar o pagamento." });
  }
});

router.get("/pedidos/:referencia", async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT referencia, valor, status, forma_pagamento, criado_em, atualizado_em
       FROM Tbl_Pedido_Online po
       JOIN Tbl_Cliente c ON c.id = po.id_Cliente
       WHERE po.referencia = ? AND c.id_Usuario = ? LIMIT 1`,
      [req.params.referencia, req.usuario.id],
    );
    if (!pedidos[0]) return res.status(404).json({ error: "Pedido não encontrado." });
    return res.json(pedidos[0]);
  } catch (error) {
    console.error("Erro ao consultar pedido:", error);
    return res.status(500).json({ error: "Não foi possível consultar o pedido." });
  }
});
//Routes para o dashboard
router.get("/dashboard/faturamento-tarja", dashboardController.getFaturamentoPorTarja);
router.get("/dashboard/faturamento-forma-pagamento", dashboardController.getFaturamentoPorFormadePagamento);

module.exports = router;

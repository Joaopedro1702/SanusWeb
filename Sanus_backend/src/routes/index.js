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
const validarTelefone = require("../middleware/validaTelefone.js");
const db = require("../connection/db.js");
const crypto = require("crypto");
const vendaUsuario = require("../repositories/vendaRepository");
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


// O cadastro feito pelo site precisa criar também o registro de cliente,
// pois apenas clientes podem finalizar compras online.
router.post("/usuarios", validarCpf, validarTelefone, (req, res, next) => {
  req.body.aceitaOfertas = Boolean(req.body.aceitaOfertas);
  return criarCtl(cliente.criarCliente)(req, res, next);
});

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

      const [vendas] = await db.query(
        "SELECT id, valor, mp_payment_id FROM Tbl_Venda WHERE referencia = ? LIMIT 1",
        [referencia],
      );
      const venda = vendas[0];
      // Eventos de pagamentos que não pertencem a uma venda Sanus são ignorados.
      if (!venda) return res.sendStatus(200);

      const valorPago = Number(pagamento.transaction_amount);
      if (
        String(pagamento.currency_id) !== "BRL" ||
        Math.round(valorPago * 100) !== Math.round(Number(venda.valor) * 100)
      ) {
        console.error("Pagamento Mercado Pago diverge da venda", referencia);
        return res.sendStatus(200);
      }

      const estadosPermitidos = new Set([
        "approved", "pending", "in_process", "rejected", "cancelled", "refunded", "charged_back",
      ]);
      const status = estadosPermitidos.has(pagamento.status) ? pagamento.status : "pending";
      await db.query(
        `UPDATE Tbl_Venda
         SET status_pagamento = ?, mp_payment_id = ?
         WHERE referencia = ? AND (mp_payment_id IS NULL OR mp_payment_id = ?)`,
        [status, String(pagamento.id), referencia, String(pagamento.id)],
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
const venda = require("../repositories/vendaRepository");
crud("produtos", {
  criar: produto.cadastroProduto,
  buscar: produto.listaProdutosPorId,
  listar: produto.listarProdutos,
  atualizar: produto.atualizarProduto,
  deletar: produto.deletarProduto,
});

const estoque = require("../repositories/estoqueRepository");
const { error } = require("console");
crud("estoque", {
  criar: estoque.criarEstoque,
  buscar: estoque.buscarEstoquePorId,
  listar: estoque.listarEstoque,
  atualizar: estoque.atualizarEstoque,
  deletar: estoque.deletarEstoque,
});
router.post("/estoque/repor", criarCtl(estoque.reporEstoque));

//Routes para vendas
crud("vendas", {
  criar: venda.criarVenda,
  buscar: venda.buscarVendaPorId,
  listar: venda.listarVendas,
  atualizar: venda.atualizarVenda,
  deletar: venda.deletarVenda,
});

//Routes para perfil

router.get("/perfil", async (req, res) => {
  const perfil = await usuarioRepo.buscarPerfilUsuario({id: req.usuario.id});
  if(!perfil) return res.status(404).json({error: "Usuário não encontrado"});
  res.json(perfil);
});

router.put("/perfil", validarTelefone, async (req, res, next) => {
  try {
    const { nome, email, data_Nasc, telefone } = req.body;

    if (!nome?.trim() || !email?.trim() || !data_Nasc) {
      return res.status(400).json({ error: "Preencha nome, e-mail e data de nascimento." });
    }

    const perfil = await usuarioRepo.atualizarPerfilUsuario({
      id: req.usuario.id,
      nome: nome.trim(),
      email: email.trim(),
      data_Nasc,
      telefone,
    });

    if (!perfil) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(perfil);
  } catch (erro) {
    return next(erro);
  }
});

//Rotas para pedido via token

router.get("/perfil/pedidos", async (req,res, next) => {
  try{
    const pedidos = await vendaUsuario.pedidoToken({idUsuario: req.usuario.id});
    return res.json(pedidos)
  }catch(erro){
    next(erro)
  }
});

router.post("/perfil/logout",(req, res) => {
    res.json({
      mensagem: 'Logou realizado com sucesso!'
    });
  });

//Routes para o dashboard
router.get("/dashboard/faturamento-tarja", dashboardController.getFaturamentoPorTarja);
router.get("/dashboard/faturamento-forma-pagamento", dashboardController.getFaturamentoPorFormadePagamento);

module.exports = router;

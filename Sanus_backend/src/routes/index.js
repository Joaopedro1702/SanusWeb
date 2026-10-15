const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { jwtSecret} = require('../config');
const criarCtl = require("../controllers/criarController.js");
const consultar = require("../controllers/consultarController.js");
const atualizarCtl = require ("../controllers/atualizarController.js");
const apagar = require("../controllers/apagarController.js");
const dashboardController = require("../controllers/dashboardController.js") 
const usuarioRepo = require("../repositories/usuarioRepository.js");
const { autenticar } = require("../middleware/auth.js");
const usuario = require("../repositories/usuarioRepository");

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

router.post("/usuarios", criarCtl(usuario.criarUsuario));

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

//Routes para o dashboard
router.get("/dashboard/faturamento-tarja", dashboardController.getFaturamentoPorTarja);
router.get("/dashboard/faturamento-forma-pagamento", dashboardController.getFaturamentoPorFormadePagamento);

module.exports = router;

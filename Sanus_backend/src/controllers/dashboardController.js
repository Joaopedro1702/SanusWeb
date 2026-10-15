const vendasRepository = require("../repositories/vendaRepository");

//Função que vai levar os dados dos produtos mais vendidos por tarja
//No dashboard

async function getFaturamentoPorTarja(req, res) {
    try{
        const data = await vendasRepository.faturamentoPorTarjaEMes();
        res.json(data);
    }catch(erro){
        console.error(erro);
        res.status(500).json({mensagem: "Erro ao buscar faturamento"})
    }
}

//Função que vai levar os dados das formas de pagamentos mais usadas por clientes
//Para o dashboard

async function getFaturamentoPorFormadePagamento(req, res){
    try{
        const data = await vendasRepository.faturamentoPorFormaPagamento();
        res.json(data);
    }catch(erro){
        console.error(erro);
        res.status(500).json({mensagem: "Erro ao buscar formas de pagamento no banco de dados"})
    }
}

module.exports = {
    getFaturamentoPorTarja,
    getFaturamentoPorFormadePagamento,
}
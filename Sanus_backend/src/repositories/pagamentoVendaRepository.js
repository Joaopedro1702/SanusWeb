const db = require("../connection/db");

//Criando pagamentoVenda
async function criarPagamentoVenda({id_Venda, forma_Pagamento, valor_Pago, valor_Recebido, troco, situacao}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Pagamento_Venda (id_Venda, forma_Pagamento, valor_Pago, valor_Recebido, troco, situacao) VALUES (?, ?, ?, ?, ?, ?)",
        [id_Venda, forma_Pagamento, valor_Pago, valor_Recebido, troco, situacao]
    );
    return result;
}

//Criando função de buscar pagamentoVenda por id
async function buscarPagamentoVendaPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Pagamento_Venda WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar pagamentoVenda
async function atualizarPagamentoVenda({id, id_Venda, forma_Pagamento, valor_Pago, valor_Recebido, troco, situacao}){
    const [result] = await db.query(
        `UPDATE Tbl_Pagamento_Venda
        SET id_Venda = ?, forma_Pagamento = ?, valor_Pago = ?, valor_Recebido = ?, troco = ?, situacao = ?
        WHERE id = ?`,
        [id_Venda, forma_Pagamento, valor_Pago, valor_Recebido, troco, situacao, id]
    );
    return result;
}

//Criando função para deletar pagamentoVenda
async function deletarPagamentoVenda({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Pagamento_Venda WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarPagamentoVenda,
    buscarPagamentoVendaPorId,
    atualizarPagamentoVenda,
    deletarPagamentoVenda
};

const db = require("../connection/db");

//Criando produtoCompra
async function criarProdutoCompra({id_Produto, id_Compra, qnt, valor_Unitario}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Produto_Compra (id_Produto, id_Compra, qnt, valor_Unitario) VALUES (?, ?, ?, ?)",
        [id_Produto, id_Compra, qnt, valor_Unitario]
    );
    return result;
}

//Criando função de buscar produtoCompra por id
async function buscarProdutoCompraPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Produto_Compra WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar produtoCompra
async function atualizarProdutoCompra({id, id_Produto, id_Compra, qnt, valor_Unitario}){
    const [result] = await db.query(
        `UPDATE Tbl_Produto_Compra
        SET id_Produto = ?, id_Compra = ?, qnt = ?, valor_Unitario = ?
        WHERE id = ?`,
        [id_Produto, id_Compra, qnt, valor_Unitario, id]
    );
    return result;
}

//Criando função para deletar produtoCompra
async function deletarProdutoCompra({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Produto_Compra WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarProdutoCompra,
    buscarProdutoCompraPorId,
    atualizarProdutoCompra,
    deletarProdutoCompra
};

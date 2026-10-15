const db = require("../connection/db");

//Criando compra
async function criarCompra({id_Fornecedor, data_Compra, total_Compra}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Compra (id_Fornecedor, data_Compra, total_Compra) VALUES (?, ?, ?)",
        [id_Fornecedor, data_Compra, total_Compra]
    );
    return result;
}

//Criando função de buscar compra por id
async function buscarCompraPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Compra WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar compra
async function atualizarCompra({id, id_Fornecedor, data_Compra, total_Compra}){
    const [result] = await db.query(
        `UPDATE Tbl_Compra
        SET id_Fornecedor = ?, data_Compra = ?, total_Compra = ?
        WHERE id = ?`,
        [id_Fornecedor, data_Compra, total_Compra, id]
    );
    return result;
}

//Criando função para deletar compra
async function deletarCompra({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Compra WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarCompra,
    buscarCompraPorId,
    atualizarCompra,
    deletarCompra
};

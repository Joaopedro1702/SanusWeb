const db = require("../connection/db");

//Criando estoque
async function criarEstoque({id_Lote, posicao}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Estoque (id_Lote, posicao) VALUES (?, ?)",
        [id_Lote, posicao]
    );
    return result;
}

//Criando função de buscar estoque por id
async function buscarEstoquePorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Estoque WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar estoque
async function atualizarEstoque({id, id_Lote, posicao}){
    const [result] = await db.query(
        `UPDATE Tbl_Estoque
        SET id_Lote = ?, posicao = ?
        WHERE id = ?`,
        [id_Lote, posicao, id]
    );
    return result;
}

//Criando função para deletar estoque
async function deletarEstoque({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Estoque WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarEstoque,
    buscarEstoquePorId,
    atualizarEstoque,
    deletarEstoque
};

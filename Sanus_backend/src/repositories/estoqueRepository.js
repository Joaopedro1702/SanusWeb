const db = require("../connection/db");

//Criando estoque
async function criarEstoque({id_Lote, posicao}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Estoque (id_Lote, posicao) VALUES (?, ?)",
        [id_Lote, posicao]
    );
    return result;
}

//Função que será responsável por ver os produtos que estã faltando no estoque
//
//nela eu chamo a procedure sp_reporEstoque, nela tem o JSON.stringify(itens)
//que vai servir para transformar o array de JavaScript em texto
//a procedure recebe p_itens como LONGTEXT, ou seja, uma string. O MySQL,
//não entende um array do node, então cnvertemos antes.
//Sem o stringify, mysql12 tentaria expandir o array em vários valores soltos (? vira 1, 2, 3...)
//e o número de parâmetros deixaria de bater com a procedure.
//RESUMINDO: O array vai como um único texto, e o banco o "desmonta" lá dentro.
async function reporEstoque({id_Fornecedor, total_Compra, itens}){
    const [result] = await db.query(
        "CALL sp_ReporEstoque(?, ?, ?)"
        [id_Fornecedor, total_Compra, JSON.stringify(itens)]
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
    reporEstoque,
    buscarEstoquePorId,
    atualizarEstoque,
    deletarEstoque
};

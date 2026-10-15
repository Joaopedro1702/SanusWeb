const db = require("../connection/db");

//Criando produtoVenda
async function criarProdutoVenda({id_Venda, id_Produto, qnt, valor_Unitario}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Produto_Venda (id_Venda, id_Produto, qnt, valor_Unitario) VALUES (?, ?, ?, ?)",
        [id_Venda, id_Produto, qnt, valor_Unitario]
    );
    return result;
}

//Criando função de buscar produtoVenda por id
async function buscarProdutoVendaPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Produto_Venda WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar produtoVenda
async function atualizarProdutoVenda({id, id_Venda, id_Produto, qnt, valor_Unitario}){
    const [result] = await db.query(
        `UPDATE Tbl_Produto_Venda
        SET id_Venda = ?, id_Produto = ?, qnt = ?, valor_Unitario = ?
        WHERE id = ?`,
        [id_Venda, id_Produto, qnt, valor_Unitario, id]
    );
    return result;
}

//Criando função para deletar produtoVenda
async function deletarProdutoVenda({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Produto_Venda WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarProdutoVenda,
    buscarProdutoVendaPorId,
    atualizarProdutoVenda,
    deletarProdutoVenda
};

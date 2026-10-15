const db = require("../connection/db");

//Criando produto

async function cadastroProduto({nome, descricao, preco, tarja}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Produto (nome, descricao, preco, tarja) VALUES (?, ?, ?, ?)",
    [nome, descricao, preco, tarja]
    );
    return result;

}

//Atualizando produto
async function atualizarProduto({id,nome, descricao, preco, tarja}){
    const [result] = await db.query(
        `UPDATE Tbl_Produto
        SET nome = ?, descricao = ?, preco = ?, tarja = ?
        WHERE id = ?
        `,
        [nome, descricao, preco, tarja, id]
    );
    return result
}

//Listando fornecedores
async function listarProdutos(){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Produto`,
    );
    return result
}


//buscando por id
async function listaProdutosPorId({id}){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Produto
        WHERE id = ?`,
        [id]
    );
    return result
}
/*
//Buscando por preco
async function listarProdutosPorCnpj({preco}){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Produto
        WHERE preco = ?`,
        [cnpj]
    );
    return result
}
*/

//Deletar fornecedor
async function deletarProduto({id}){
    const [result] = await db.query(
        `DELETE FROM Tbl_Produto
        WHERE id = ?`,
        [id]
    )
    return result
}

module.exports = {
    cadastroProduto,
    atualizarProduto,
    listarProdutos,
    listaProdutosPorId,
    deletarProduto
};
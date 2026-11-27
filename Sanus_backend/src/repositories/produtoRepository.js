const db = require("../connection/db");

//Criando produto

async function cadastroProduto({nome, descricao, preco, tarja, foto_produto = null, cod_barras}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Produto (nome, descricao, preco, tarja, foto_produto, cod_barras) VALUES (?, ?, ?, ?, ?, ?)",
    [nome, descricao, preco, tarja, foto_produto, cod_barras]
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

//Procedure para ver quantidade de produtos vindo direto do banco de dados em MySQL
async function viewQuantidadeProduto(id_Produto){
    const [result] = await db.query(
        "CALL sp_ViewQntProduto",
        [id_Produto]
    );
    return result[0];
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

async function atualizarFotoProduto({ id, foto_produto }) {
    const [resultado] = await db.query(
        "UPDATE Tbl_Produto SET foto_produto = ? WHERE id = ?",
        [foto_produto, id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    atualizarFotoProduto,
    cadastroProduto,
    atualizarProduto,
    listarProdutos,
    listaProdutosPorId,
    deletarProduto,
    viewQuantidadeProduto
};
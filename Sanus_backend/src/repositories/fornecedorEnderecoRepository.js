const db = require("../connection/db");

//Criando fornecedor_endereco
async function criarFornecedorEndereco({id_Fornecedor, id_Endereco, numero, complemento, referencia}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Fornecedor_Endereco (id_Fornecedor, id_Endereco, numero, complemento, referencia) VALUES (?, ?, ?, ?, ?)",
        [id_Fornecedor, id_Endereco, numero, complemento, referencia]
    );
    return result;
}

//Criando função de buscar fornecedor_endereco por id
async function buscarFornecedorEnderecoPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Fornecedor_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar fornecedor_endereco
async function atualizarFornecedorEndereco({id, id_Fornecedor, id_Endereco, numero, complemento, referencia}){
    const [result] = await db.query(
        `UPDATE Tbl_Fornecedor_Endereco
        SET id_Fornecedor = ?, id_Endereco = ?, numero = ?, complemento = ?, referencia = ?
        WHERE id = ?`,
        [id_Fornecedor, id_Endereco, numero, complemento, referencia, id]
    );
    return result;
}

//Criando função para deletar fornecedor_endereco
async function deletarFornecedorEndereco({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Fornecedor_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarFornecedorEndereco,
    buscarFornecedorEnderecoPorId,
    atualizarFornecedorEndereco,
    deletarFornecedorEndereco
};

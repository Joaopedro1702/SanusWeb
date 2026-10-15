const db = require("../connection/db");

//Criando telefone_fornecedor
async function criarTelefoneFornecedor({id_Fornecedor, telefone}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Telefone_Fornecedor (id_Fornecedor, telefone) VALUES (?, ?)",
        [id_Fornecedor, telefone]
    );
    return result;
}

//Criando função de buscar telefone_fornecedor por id
async function buscarTelefoneFornecedorPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Telefone_Fornecedor WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar telefone_fornecedor
async function atualizarTelefoneFornecedor({id, id_Fornecedor, telefone}){
    const [result] = await db.query(
        `UPDATE Tbl_Telefone_Fornecedor
        SET id_Fornecedor = ?, telefone = ?
        WHERE id = ?`,
        [id_Fornecedor, telefone, id]
    );
    return result;
}

//Criando função para deletar telefone_fornecedor
async function deletarTelefoneFornecedor({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Telefone_Fornecedor WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarTelefoneFornecedor,
    buscarTelefoneFornecedorPorId,
    atualizarTelefoneFornecedor,
    deletarTelefoneFornecedor
};

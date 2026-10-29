const db = require("../connection/db");

//Criando fornecedor

async function cadastroFornecedor({nome, cnpj, email, telefone, cep, logradouro, bairro, cidade, uf, id_Fornecedor, id_Endereço, numero, complemento, referencia}){
    const [result] = await db.query(
        "CALL sp_AddFornecedor (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [nome, cnpj, email, telefone, cep, logradouro, bairro, cidade, uf, id_Fornecedor, id_Endereço, numero, complemento, referencia]
    );
    return result;

}

//Atualizando fornecedor
async function atualizarFornecedor({id,nome, email}){
    const [result] = await db.query(
        `UPDATE Tbl_Fornecedor
        SET nome = ?, email = ?
        WHERE id = ?
        `,
        [nome, email, id]
    );
    return result
}

//Listando fornecedores
async function listarFornecedores(){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Fornecedor`,
    );
    return result
}

/*
//buscando por id
async function listarFornecedoresPorId({id}){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Fornecedor
        WHERE id = ?`,
        [id]
    );
    return result
}

//Buscando por cnpj
async function listarFornecedoresPorCnpj({cnpj}){
    const [result] = await db.query(
        `SELECT * FROM Tbl_Fornecedor
        WHERE cnpj = ?`,
        [cnpj]
    );
    return result
}
*/

//Deletar fornecedor
async function deletarFornecedor({id}){
    const [result] = await db.query(
        `DELETE FROM Tbl_Fornecedor
        WHERE id = ?`,
        [id]
    )
    return result
}

module.exports(
    cadastroFornecedor,
    atualizarFornecedor,
    listarFornecedores,
    deletarFornecedor
)
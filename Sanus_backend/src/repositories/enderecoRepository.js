//Desenvolvido por João Pedro

const db = require("../connection/db");

//criando funções de CRUD para clienteEndereco

async function criarEndereco({cep, logradouro, bairro, cidade, uf}) {
    const [result] = await db.query(
        "INSERT INTO Tbl_Endereco (cep, logradouro, bairro, cidade, uf) VALUES (?, ?, ?, ?, ?)",
        [cep, logradouro, bairro, cidade, uf]

    );
    return result;
}

//Buscando endereço por id

async function buscarEnderecoPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Vai buscar o endereço através do cep
async function buscarEnderecoPorCep({cep}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Endereco WHERE cep = ?",
        [cep]
    );
    return result;
}

//Listar endereço
async function listarEnderecos(){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Endereco",
    );
    return result;
}

//Função de atualizar endereço
async function atualizarEndereco({id, cep, logradouro, bairro, cidade, uf}){
    const [result] = await db.query(
        `UPDATE Tbl_Endereco
        SET cep = ?, logradouro = ?, bairro = ?, cidade = ?, uf = ?
        WHERE id = ?,
        `,
        [cep, logradouro, bairro, cidade, uf, id]
    );
    return result;
}

//Função que deleta por id
async function deletarEndereco({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções

module.exports = {
    criarEndereco,
    buscarEnderecoPorId,
    buscarEnderecoPorCep,
    listarEnderecos,
    atualizarEndereco,
    deletarEndereco
};
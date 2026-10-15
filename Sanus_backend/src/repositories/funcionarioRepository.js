const db = require("../connection/db");

//Criando funcionário
async function criarFuncionario({id_Usuario, data_admissao, cargo}) {
    const [result] = await db.query(
        `INSERT INTO Tbl_Funcionario (id_Usuario, data_admissao, cargo)
         VALUES (?, ?, ?)`,
        [id_Usuario, data_admissao, cargo]
    );

    return result;
}

//Buscando cliente por Id
async function buscarFuncionarioPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Funcionario WHERE id = ?",
        [id]
    );
    return result
}

//Buscando funcionario por fk id_Usuario

async function buscarFuncionarioPorUsuarioId({id_Usuario}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Funcionario WHERE id_Usuario = ?",
        [id_Usuario]
    );
    return result
}

//Função de listar funcionários

async function listarFuncionario(){
    const [result] = await db.query(
    "SELECT * FROM Tbl_Funcionario"
    );
    return result
}

//atualizando funcionario
async function atualizarFuncionario({id, data_admissao, cargo}){
    const [result] = await db.query(
        `UPDATE Tbl_Funcionario
        SET data_admissao = ?,cargo = ?
        WHERE id = ? `,
        [data_admissao, id, cargo]
    );
    return result;
}

//Função de deletar funcionario

async function deletarFuncionario({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Funcionario WHERE id = ?",
        [id]
    );
    return result
}

module.exports = {
    criarFuncionario,
    buscarFuncionarioPorId,
    buscarFuncionarioPorUsuarioId,
    listarFuncionario,
    atualizarFuncionario,
    deletarFuncionario
}
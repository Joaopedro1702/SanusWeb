const db = require("../connection/db");

//Criando Cliente

async function criarCliente({id_Usuario, aceita_Ofertas}) {
    const [result] = await db.query(
        `INSERT INTO Tbl_Cliente (id_Usuario, aceita_Ofertas)
         VALUES (?, ?)`,
        [id_Usuario, aceita_Ofertas]
    );

    return result;
}

//Buscando cliente por Id
async function buscarClientePorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Cliente WHERE id = ?",
        [id]
    );
    return result
}

//Buscando cliente por fk id_Usuario

async function buscarClientePorUsuarioId({id_Usuario}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Cliente WHERE id_Usuario = ?",
        [id_Usuario]
    );
    return result
}

//Função de listar usuários

async function listarClientes(){
    const [result] = await db.query(
    "SELECT * FROM Tbl_Cliente"
    );
    return result
}

//atualizando cliente
async function atualizarCliente({id, aceita_Ofertas}){
    const [result] = await db.query(
        `UPDATE Tbl_Cliente
        SET aceita_ofertas = ?
        WHERE id = ?`,
        [aceita_Ofertas, id]
    );
    return result;
}

//Função de deletar cliente

async function deletarCliente({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Cliente WHERE id = ?",
        [id]
    );
    return result
}

module.exports = {
    criarCliente,
    buscarClientePorId,
    buscarClientePorUsuarioId,
    listarClientes,
    atualizarCliente,
    deletarCliente
}
const db = require("../connection/db");

//Criando telefone_usuario
async function criarTelefoneUsuario({id_Usuario, telefone}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Telefone_Usuario (id_Usuario, telefone) VALUES (?, ?)",
        [id_Usuario, telefone]
    );
    return result;
}

//Criando função de buscar telefone_usuario por id
async function buscarTelefoneUsuarioPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Telefone_Usuario WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar telefone_usuario
async function atualizarTelefoneUsuario({id, id_Usuario, telefone}){
    const [result] = await db.query(
        `UPDATE Tbl_Telefone_Usuario
        SET id_Usuario = ?, telefone = ?
        WHERE id = ?`,
        [id_Usuario, telefone, id]
    );
    return result;
}

//Criando função para deletar telefone_usuario
async function deletarTelefoneUsuario({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Telefone_Usuario WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarTelefoneUsuario,
    buscarTelefoneUsuarioPorId,
    atualizarTelefoneUsuario,
    deletarTelefoneUsuario
};

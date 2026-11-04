const db = require("../connection/db");
const bcrypt = require("bcryptjs");
const SALT_ROUND = 10;
//Criando usuário
async function criarUsuario({nome, cpf, email, senha, data_Nasc, telefone, idUsuario}){
    const senhaHash = await bcrypt.hash(senha, SALT_ROUND);
    const connection = await db.getConnection();

    try {
        await connection.query(
            "CALL sp_AddUsuario(?, ?, ?, ?, ?, ?, @novo_usuario_id)",
            [nome, cpf, email, senhaHash, data_Nasc, telefone]
        );
        const [[resultado]] = await connection.query(
            "SELECT @novo_usuario_id AS insertId"
        );
        return resultado;
    } finally {
        connection.release();
    }
}

//Criando função de buscar usuário por id
async function buscarUsuarioPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Usuario WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de buscar usuário por Cpf

/*async function buscarUsuarioPorCpf({cpf}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Usuario WHERE cpf = ?",
        [cpf]
    );
    return result;
}*/

async function buscarUsuarioPorEmail({email}) {
    const [result] = await db.query(
        "SELECT * FROM Tbl_Usuario WHERE email = ?", [email]
    );
    return result[0];
}

//Criando função de criar usuário
async function atualizarUsuario({id, nome, cpf, email, senha, data_Nasc}){
    const senhaHash = await bcrypt.hash(senha, SALT_ROUND);    
    const [result] = await db.query(
        `UPDATE Tbl_Usuario
        SET nome = ?, cpf =?, email = ?, senha = ?, data_Nasc = ?
        WHERE id = ?`,
        [nome, cpf, email, senhaHash, data_Nasc, id]
        );
        return result;
}

//Criando função para deletar usuário
async function deletarUsuario({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Usuario WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarUsuario,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    atualizarUsuario,
    deletarUsuario
};

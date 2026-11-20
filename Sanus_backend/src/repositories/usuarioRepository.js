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

async function atualizarPerfilUsuario({ id, nome, email, data_Nasc, telefone }) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [usuarioAtualizado] = await connection.query(
            `UPDATE Tbl_Usuario
             SET nome = ?, email = ?, data_Nasc = ?
             WHERE id = ?`,
            [nome, email, data_Nasc, id]
        );

        if (usuarioAtualizado.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        const [telefones] = await connection.query(
            "SELECT id FROM Tbl_Telefone_Usuario WHERE id_Usuario = ? LIMIT 1",
            [id]
        );

        if (telefones[0]) {
            await connection.query(
                "UPDATE Tbl_Telefone_Usuario SET telefone = ? WHERE id = ?",
                [telefone, telefones[0].id]
            );
        } else {
            await connection.query(
                "INSERT INTO Tbl_Telefone_Usuario (id_Usuario, telefone) VALUES (?, ?)",
                [id, telefone]
            );
        }

        await connection.commit();
        return { nome, email, data_Nasc, telefone };
    } catch (erro) {
        await connection.rollback();
        throw erro;
    } finally {
        connection.release();
    }
}

//Criando função para deletar usuário
async function deletarUsuario({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Usuario WHERE id = ?",
        [id]
    );
    return result;
}

//Usuario perfil

async function buscarPerfilUsuario({id}){
    const [result] = await db.query(
        `SELECT u.nome, u.email, u.cpf, u.data_Nasc, t.telefone
         FROM Tbl_Usuario u
         LEFT JOIN Tbl_Telefone_Usuario t ON t.id_Usuario = u.id
         WHERE u.id = ?`,
        [id]
    );
    return result[0];

}

//Foto de perfil de usuário
async function fotoPerfil({id}){
    const [resultado] = await db.query(
        "SELECT foto_perfil FROM Tbl_Usuario WHERE id = ?",
        [id]
    );
    return resultado[0]?.foto_perfil ?? null;
}

async function atualizarFotoPerfil({ id, foto }) {
    const [resultado] = await db.query(
        "UPDATE Tbl_Usuario SET foto_perfil = ? WHERE id = ?",
        [foto, id]
    );
    return resultado.affectedRows > 0;
}

//Utilizando todas as funções
module.exports = {
    criarUsuario,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    atualizarUsuario,
    atualizarPerfilUsuario,
    deletarUsuario,
    buscarPerfilUsuario,
    fotoPerfil,
    atualizarFotoPerfil
};

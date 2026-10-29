const db = require("../connection/db");

//Criando Cliente
async function criarCliente({nome, cpf, email, senha, data_Nasc, telefone, aceitaOfertas}){
    
    const senhaHash = await bcrypt.hash(senha, SALT_ROUND);
    const [result] = await db.query(
        "CALL sp_AddCliente (?, ?, ?, ?, ?, ?, ?)",
        [nome, cpf, email, senhaHash, data_Nasc, telefone, aceitaOfertas]
    );
    return result;
};

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

async function visualizarCliente({id_Usuario}){
    const [result] = await db.query(
        "CALL sp_ViewCliente(?)",
        [id_Usuario]
    );
    return result[0];
}

//Função para o "Minha conta" do cliente, onde lee vai poder ver
//seus dados cadastrais e altera-los.
async function visualizarContaCliente({id_Usuario}){
    const [result] = await db.query(
        "CALL sp_ViewContaCliente",
        [id_Usuario]
    );
    return result[0];
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
    visualizarCliente,
    visualizarContaCliente,
    listarClientes,
    atualizarCliente,
    deletarCliente
}
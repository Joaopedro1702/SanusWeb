const db = require("../connection/db");

//Criando cliente_endereco
async function criarClienteEndereco({id_Cliente, id_Endereco, numero, complemento, referencia}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Cliente_Endereco (id_Cliente, id_Endereco, numero, complemento, referencia) VALUES (?, ?, ?, ?, ?)",
        [id_Cliente, id_Endereco, numero, complemento, referencia]
    );
    return result;
}

//Criando função de buscar cliente_endereco por id
async function buscarClienteEnderecoPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Cliente_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar cliente_endereco
async function atualizarClienteEndereco({id, id_Cliente, id_Endereco, numero, complemento, referencia}){
    const [result] = await db.query(
        `UPDATE Tbl_Cliente_Endereco
        SET id_Cliente = ?, id_Endereco = ?, numero = ?, complemento = ?, referencia = ?
        WHERE id = ?`,
        [id_Cliente, id_Endereco, numero, complemento, referencia, id]
    );
    return result;
}

//Criando função para deletar cliente_endereco
async function deletarClienteEndereco({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Cliente_Endereco WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarClienteEndereco,
    buscarClienteEnderecoPorId,
    atualizarClienteEndereco,
    deletarClienteEndereco
};

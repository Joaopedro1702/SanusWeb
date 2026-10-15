const db = require("../connection/db");

//Criando lote
async function criarLote({id_Produto_Compra, cod, qnt, validade}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Lote (id_Produto_Compra, cod, qnt, validade) VALUES (?, ?, ?, ?)",
        [id_Produto_Compra, cod, qnt, validade]
    );
    return result;
}

//Criando função de buscar lote por id
async function buscarLotePorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Lote WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar lote
async function atualizarLote({id, id_Produto_Compra, cod, qnt, validade}){
    const [result] = await db.query(
        `UPDATE Tbl_Lote
        SET id_Produto_Compra = ?, cod = ?, qnt = ?, validade = ?
        WHERE id = ?`,
        [id_Produto_Compra, cod, qnt, validade, id]
    );
    return result;
}

//Criando função para deletar lote
async function deletarLote({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Lote WHERE id = ?",
        [id]
    );
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarLote,
    buscarLotePorId,
    atualizarLote,
    deletarLote
};

const db = require("../connection/db");

//Criando venda
async function criarVenda({id_Cliente, id_Funcionario, nfe, valor, data_Venda, canal_Venda}){
    const [result] = await db.query(
        "INSERT INTO Tbl_Venda (id_Cliente, id_Funcionario, nfe, valor, data_Venda, canal_Venda) VALUES (?, ?, ?, ?, ?, ?)",
        [id_Cliente, id_Funcionario, nfe, valor, data_Venda, canal_Venda]
    );
    return result;
}

//Criando função de buscar venda por id
async function buscarVendaPorId({id}){
    const [result] = await db.query(
        "SELECT * FROM Tbl_Venda WHERE id = ?",
        [id]
    );
    return result;
}

//Criando função de atualizar venda
async function atualizarVenda({id, id_Cliente, id_Funcionario, nfe, valor, data_Venda, canal_Venda}){
    const [result] = await db.query(
        `UPDATE Tbl_Venda
        SET id_Cliente = ?, id_Funcionario = ?, nfe = ?, valor = ?, data_Venda = ?, canal_Venda = ?
        WHERE id = ?`,
        [id_Cliente, id_Funcionario, nfe, valor, data_Venda, canal_Venda, id]
    );
    return result;
}

//Criando função para deletar venda
async function deletarVenda({id}){
    const [result] = await db.query(
        "DELETE FROM Tbl_Venda WHERE id = ?",
        [id]
    );
    return result;
}

async function faturamentoPorTarjaEMes() {
    const [result] = await db.query(`
        SELECT p.tarja,
        YEAR(v.data_Venda) AS ano,
        MONTH(v.data_Venda) AS mes, 
        SUM(pv.qnt * pv.valor_Unitario) AS total
        FROM Tbl_Venda v
        JOIN Tbl_Produto_Venda pv ON v.id = pv.id_Venda
        JOIN Tbl_Produto p ON pv.id_Produto = p.id
        GROUP BY p.tarja, mes
        ORDER BY mes
    `);
    return result;
}

async function faturamentoPorFormaPagamento() {
    const [result] = await db.query(`
        SELECT pg.forma_Pagamento, 
        YEAR(v.data_Venda) AS ano,
        MONTH(v.data_Venda) AS mes, SUM(pg.valor_Pago) AS total
        FROM Tbl_Pagamento_Venda pg
        JOIN Tbl_Venda v ON pg.id_Venda = v.id
        GROUP BY pg.forma_Pagamento, mes
        ORDER BY mes
    `);
    return result;
}

//Utilizando todas as funções
module.exports = {
    criarVenda,
    buscarVendaPorId,
    atualizarVenda,
    deletarVenda,
    faturamentoPorTarjaEMes,
    faturamentoPorFormaPagamento
};

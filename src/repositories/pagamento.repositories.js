// src/repositories/pagamento.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const Pagamento = require('../models/pagamento.model');

// =================================================================
// FUNÇÃO CORRIGIDA
// =================================================================
async function executeInTransaction(actions) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        // A transação começa implicitamente na primeira execução de DML.
        const results = await actions(connection);
        await connection.commit(); // Confirma a transação
        return results;
    } catch (err) {
        if (connection) {
            try { 
                await connection.rollback(); // Desfaz em caso de erro
            } catch (rollErr) { 
                console.error(rollErr); 
            }
        }
        throw err;
    } finally {
        if (connection) {
            try { 
                await connection.close(); 
            } catch (err) { 
                console.error(err); 
            }
        }
    }
}
// =================================================================

const createPagamento = async (pagamentoData, valorPedido) => {
    return executeInTransaction(async (connection) => {
        // 1. Cria o registro de pagamento
        const createPagamentoSql = `INSERT INTO pagamento (pedido_id, valor, status, metodo) VALUES (:pedido_id, :valor, :status, :metodo) RETURNING id INTO :id`;
        const pagamentoBind = {
            pedido_id: pagamentoData.pedido_id,
            valor: valorPedido,
            status: 'APROVADO',
            metodo: pagamentoData.metodo,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        const pagamentoResult = await connection.execute(createPagamentoSql, pagamentoBind);
        const pagamento_id = pagamentoResult.outBinds.id[0];

        // 2. Atualiza o status do pedido
        const updatePedidoSql = `UPDATE pedido SET status = :status WHERE id = :id`;
        await connection.execute(updatePedidoSql, { status: 'PAGO', id: pagamentoData.pedido_id });

        return new Pagamento(pagamento_id, pagamentoData.pedido_id, valorPedido, 'APROVADO', pagamentoData.metodo);
    });
};

const findPagamentoByPedidoId = async (pedido_id) => {
    const sql = `SELECT * FROM pagamento WHERE pedido_id = :pedido_id`;
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, [pedido_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    await connection.close();
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Pagamento(row.ID, row.PEDIDO_ID, row.VALOR, row.STATUS, row.METODO);
};

module.exports = {
    createPagamento,
    findPagamentoByPedidoId
};
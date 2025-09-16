// src/repositories/pagamento.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');

// Função transacional para executar ações no banco
async function execute(actions) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.beginTransaction();
        const results = await actions(connection);
        await connection.commit();
        return results;
    } catch (err) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollErr) {
                console.error("Erro ao fazer rollback:", rollErr);
            }
        }
        console.error(err);
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

const createPagamento = async (pagamento) => {
    return execute(async (connection) => {
        // 1. Busca o valor total do pedido para garantir consistência
        const pedidoSql = `SELECT total FROM pedido WHERE id = :pedido_id`;
        const pedidoResult = await connection.execute(pedidoSql, [pagamento.pedido_id]);
        if (pedidoResult.rows.length === 0) {
            throw new Error("Pedido não encontrado.");
        }
        const valorPedido = pedidoResult.rows[0][0];

        // 2. Cria o registro de pagamento
        const createPagamentoSql = `
            INSERT INTO pagamento (pedido_id, valor, status, metodo) 
            VALUES (:pedido_id, :valor, :status, :metodo) 
            RETURNING id INTO :id`;
        
        const pagamentoBind = {
            pedido_id: pagamento.pedido_id,
            valor: valorPedido, // Usa o valor do pedido
            status: 'APROVADO', // Status inicial
            metodo: pagamento.metodo,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const pagamentoResult = await connection.execute(createPagamentoSql, pagamentoBind);
        const pagamento_id = pagamentoResult.outBinds.id[0];

        // 3. Atualiza o status do pedido
        const updatePedidoSql = `UPDATE pedido SET status = :status WHERE id = :id`;
        await connection.execute(updatePedidoSql, { status: 'PAGO', id: pagamento.pedido_id });

        return { id: pagamento_id, ...pagamentoBind };
    });
};

const findPagamentoByPedidoId = async (pedido_id) => {
    const sql = `SELECT * FROM pagamento WHERE pedido_id = :pedido_id`;
    // Não precisa de transação para uma simples leitura
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, [pedido_id]);
        if (result.rows.length === 0) return null;

        const [id, _, valor, status, metodo] = result.rows[0];
        return { id, pedido_id, valor, status, metodo };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

module.exports = {
    createPagamento,
    findPagamentoByPedidoId
};
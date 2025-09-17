// src/repositories/pagamento.repositories.js
const oracledb = require('oracledb');
// Importe ambas as funções do nosso módulo de banco de dados
const { execute, executeTransaction } = require('../config/database');
const Pagamento = require('../models/pagamento.model');

const createPagamento = async (pagamentoData, valorPedido) => {
    // Use a nova função de transação do pool
    return executeTransaction(async (connection) => {
        // 1. Cria o registro de pagamento
        const createPagamentoSql = `INSERT INTO pagamento (pedido_id, valor, status, metodo) VALUES (:pedido_id, :valor, :status, :metodo) RETURNING id INTO :id`;
        const pagamentoBind = {
            pedido_id: pagamentoData.pedido_id,
            valor: valorPedido,
            status: 'APROVADO',
            metodo: pagamentoData.metodo,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        // Note que agora usamos connection.execute, pois a conexão é gerenciada pela função 'executeTransaction'
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
    // Use a função 'execute' do pool para uma leitura simples
    const result = await execute(sql, [pedido_id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Pagamento(row.ID, row.PEDIDO_ID, row.VALOR, row.STATUS, row.METODO);
};

module.exports = {
    createPagamento,
    findPagamentoByPedidoId
};
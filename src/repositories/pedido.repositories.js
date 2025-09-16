// src/repositories/pedido.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const { Pedido, ItemPedido } = require('../models/pedido.model');

// =================================================================
// FUNÇÃO CORRIGIDA
// =================================================================
async function executeInTransaction(actions) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        // A transação começa implicitamente na primeira execução de DML.
        // Não é necessário chamar beginTransaction().
        const results = await actions(connection);
        await connection.commit(); // Confirma a transação se tudo deu certo
        return results;
    } catch (err) {
        if (connection) {
            try { 
                await connection.rollback(); // Desfaz a transação em caso de erro
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

const createPedidoFromCarrinho = async (carrinho) => {
    return executeInTransaction(async (connection) => {
        // 1. Criar o pedido
        const total = carrinho.calcularTotal();
        const createPedidoSql = `INSERT INTO pedido (cliente_id, total, status) VALUES (:cliente_id, :total, :status) RETURNING id INTO :id`;
        const pedidoBind = {
            cliente_id: carrinho.cliente_id,
            total,
            status: 'CRIADO',
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        // As opções { autoCommit: false } são o padrão, mas é bom ser explícito dentro de uma transação.
        const pedidoResult = await connection.execute(createPedidoSql, pedidoBind, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const pedido_id = pedidoResult.outBinds.id[0];

        // 2. Inserir itens no pedido
        const createItemPedidoSql = `INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (:1, :2, :3, :4)`;
        const itensPedidoBinds = carrinho.itens.map(item => [pedido_id, item.produto_id, item.quantidade, item.preco_unitario]);
        await connection.executeMany(createItemPedidoSql, itensPedidoBinds);

        // 3. Limpar o carrinho
        const deleteItensCarrinhoSql = `DELETE FROM item_carrinho WHERE carrinho_id = :carrinho_id`;
        await connection.execute(deleteItensCarrinhoSql, [carrinho.id]);

        const novoPedido = new Pedido(pedido_id, carrinho.cliente_id, total, 'CRIADO');
        carrinho.itens.forEach(item => novoPedido.adicionarItem(new ItemPedido(null, item.produto_id, item.quantidade, item.preco_unitario)));
        
        return novoPedido;
    });
};

const findAllPedidos = async () => {
    const sql = `SELECT * FROM pedido`;
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    await connection.close();
    return result.rows.map(row => new Pedido(row.ID, row.CLIENTE_ID, row.TOTAL, row.STATUS));
};

const findPedidoById = async (id) => {
    const sqlPedido = `SELECT * FROM pedido WHERE id = :id`;
    const sqlItens = `SELECT id, produto_id, quantidade, preco_unitario FROM item_pedido WHERE pedido_id = :id`;
    
    const connection = await oracledb.getConnection(dbConfig);
    const pedidoResult = await connection.execute(sqlPedido, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (pedidoResult.rows.length === 0) {
        await connection.close();
        return null;
    }
    
    const row = pedidoResult.rows[0];
    const pedido = new Pedido(row.ID, row.CLIENTE_ID, row.TOTAL, row.STATUS);

    const itensResult = await connection.execute(sqlItens, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    itensResult.rows.forEach(itemRow => {
        pedido.adicionarItem(new ItemPedido(itemRow.ID, itemRow.PRODUTO_ID, itemRow.QUANTIDADE, itemRow.PRECO_UNITARIO));
    });
    
    await connection.close();
    return pedido;
};

module.exports = {
    createPedidoFromCarrinho,
    findAllPedidos,
    findPedidoById
};
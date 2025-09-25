//src/repositories/pedido.repositories.js

const oracledb = require('oracledb');
const { execute, executeTransaction } = require('../config/database');
const { Pedido, ItemPedido } = require('../models/pedido.model');

const createPedidoFromCarrinho = async (carrinho) => {
    return executeTransaction(async (connection) => {
        const total = carrinho.calcularTotal();
        const createPedidoSql = `INSERT INTO pedido (cliente_id, total, status) VALUES (:cliente_id, :total, :status) RETURNING id INTO :id`;
        const pedidoBind = {
            cliente_id: carrinho.cliente_id,
            total,
            status: 'CRIADO',
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        const pedidoResult = await connection.execute(createPedidoSql, pedidoBind);
        const pedido_id = pedidoResult.outBinds.id[0];

        const createItemPedidoSql = `INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (:1, :2, :3, :4)`;
        const itensPedidoBinds = carrinho.itens.map(item => [pedido_id, item.produto_id, item.quantidade, item.preco_unitario]);
        await connection.executeMany(createItemPedidoSql, itensPedidoBinds);

        const novoPedido = new Pedido(pedido_id, carrinho.cliente_id, total, 'CRIADO');
        carrinho.itens.forEach(item => novoPedido.adicionarItem(new ItemPedido(null, item.produto_id, item.quantidade, item.preco_unitario)));
        
        return novoPedido;
    });
};

const findAllPedidos = async () => {
    const sql = `SELECT * FROM pedido`;
    const result = await execute(sql);
    return result.rows.map(row => new Pedido(row.ID, row.CLIENTE_ID, row.TOTAL, row.STATUS));
};

const findPedidoById = async (id) => {
    const sqlPedido = `SELECT * FROM pedido WHERE id = :id`;
    const pedidoResult = await execute(sqlPedido, [id]);

    if (pedidoResult.rows.length === 0) {
        return null;
    }
    
    const row = pedidoResult.rows[0];
    const pedido = new Pedido(row.ID, row.CLIENTE_ID, row.TOTAL, row.STATUS);

    const sqlItens = `SELECT id, produto_id, quantidade, preco_unitario FROM item_pedido WHERE pedido_id = :id`;
    const itensResult = await execute(sqlItens, [id]);
    
    itensResult.rows.forEach(itemRow => {
        pedido.adicionarItem(new ItemPedido(itemRow.ID, itemRow.PRODUTO_ID, itemRow.QUANTIDADE, itemRow.PRECO_UNITARIO));
    });
    
    return pedido;
};


const updateStatus = async (id, status) => {
    const sql = `UPDATE pedido SET status = :status WHERE id = :id`;
    const binds = {
        id: parseInt(id, 10),
        status: status
    };
    await execute(sql, binds, { autoCommit: true });
};


module.exports = {
    createPedidoFromCarrinho,
    findAllPedidos,
    findPedidoById,
    updateStatus 
};
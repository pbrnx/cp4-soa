// src/repositories/pedido.repositories.js
const oracledb = require('oracledb');
// Importe ambas as funções do nosso módulo de banco de dados
const { execute, executeTransaction } = require('../config/database');
const { Pedido, ItemPedido } = require('../models/pedido.model');

const createPedidoFromCarrinho = async (carrinho) => {
    // Use a nova função de transação do pool
    return executeTransaction(async (connection) => {
        // 1. Criar o pedido
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
    // Use a função 'execute' do pool
    const result = await execute(sql);
    return result.rows.map(row => new Pedido(row.ID, row.CLIENTE_ID, row.TOTAL, row.STATUS));
};

const findPedidoById = async (id) => {
    // Para operações de leitura que precisam ser consistentes, podemos usar a mesma conexão
    // mas para simplificar e otimizar, podemos fazer duas chamadas separadas ao pool.
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

module.exports = {
    createPedidoFromCarrinho,
    findAllPedidos,
    findPedidoById
};
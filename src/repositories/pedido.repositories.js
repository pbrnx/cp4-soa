// src/repositories/pedido.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');

// Função genérica para executar queries, agora transacional
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

const createPedidoFromCarrinho = async (carrinho_id) => {
    return execute(async (connection) => {
        // 1. Buscar itens do carrinho e o cliente_id
        const itensCarrinhoSql = `
            SELECT 
                c.cliente_id, 
                ic.produto_id, 
                ic.quantidade, 
                ic.preco_unitario 
            FROM item_carrinho ic
            JOIN carrinho c ON ic.carrinho_id = c.id
            WHERE ic.carrinho_id = :carrinho_id`;
        
        const itensResult = await connection.execute(itensCarrinhoSql, [carrinho_id]);

        if (itensResult.rows.length === 0) {
            throw new Error("O carrinho está vazio.");
        }

        const cliente_id = itensResult.rows[0][0];
        const total = itensResult.rows.reduce((sum, row) => sum + (row[2] * row[3]), 0);
        
        // 2. Criar o pedido
        const createPedidoSql = `
            INSERT INTO pedido (cliente_id, total, status) 
            VALUES (:cliente_id, :total, :status) 
            RETURNING id INTO :id`;
        
        const pedidoBind = {
            cliente_id,
            total,
            status: 'CRIADO',
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const pedidoResult = await connection.execute(createPedidoSql, pedidoBind);
        const pedido_id = pedidoResult.outBinds.id[0];

        // 3. Inserir itens no pedido
        const createItemPedidoSql = `
            INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario) 
            VALUES (:pedido_id, :produto_id, :quantidade, :preco_unitario)`;
        
        const itensPedidoBinds = itensResult.rows.map(row => ({
            pedido_id,
            produto_id: row[1],
            quantidade: row[2],
            preco_unitario: row[3]
        }));

        await connection.executeMany(createItemPedidoSql, itensPedidoBinds);

        // 4. Limpar o carrinho
        const deleteItensCarrinhoSql = `DELETE FROM item_carrinho WHERE carrinho_id = :carrinho_id`;
        await connection.execute(deleteItensCarrinhoSql, [carrinho_id]);

        return { id: pedido_id, cliente_id, total, status: 'CRIADO', itens: itensPedidoBinds };
    });
};

const findAllPedidos = async () => {
    const sql = `SELECT * FROM pedido`;
    const result = await execute(conn => conn.execute(sql));
    return result.rows.map(([id, cliente_id, total, status]) => ({ id, cliente_id, total, status }));
};

const findPedidoById = async (id) => {
    const sqlPedido = `SELECT * FROM pedido WHERE id = :id`;
    const sqlItens = `SELECT * FROM item_pedido WHERE pedido_id = :id`;
    
    return execute(async (connection) => {
        const pedidoResult = await connection.execute(sqlPedido, [id]);
        if (pedidoResult.rows.length === 0) return null;

        const itensResult = await connection.execute(sqlItens, [id]);

        const [pedidoId, cliente_id, total, status] = pedidoResult.rows[0];
        const itens = itensResult.rows.map(([itemId, _, produto_id, quantidade, preco_unitario]) => ({
            id: itemId,
            produto_id,
            quantidade,
            preco_unitario
        }));

        return { id: pedidoId, cliente_id, total, status, itens };
    });
};

module.exports = {
    createPedidoFromCarrinho,
    findAllPedidos,
    findPedidoById
};
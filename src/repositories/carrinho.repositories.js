// src/repositories/carrinho.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');

async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, { ...options, autoCommit: true });
        return result;
    } catch (err) {
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

const findCarrinhoByClienteId = async (cliente_id) => {
    const sql = `
        SELECT 
            c.id as carrinho_id, 
            ic.id as item_id, 
            p.id as produto_id, 
            p.nome, 
            ic.quantidade, 
            ic.preco_unitario
        FROM carrinho c
        LEFT JOIN item_carrinho ic ON c.id = ic.carrinho_id
        LEFT JOIN produto p ON ic.produto_id = p.id
        WHERE c.cliente_id = :cliente_id
    `;
    const result = await execute(sql, [cliente_id]);
    
    if (result.rows.length === 0) {
        // Se não encontrar o carrinho, cria um para o cliente
        return createCarrinho(cliente_id);
    }

    const carrinho = {
        id: result.rows[0][0],
        cliente_id: cliente_id,
        itens: []
    };

    result.rows.forEach(row => {
        if (row[1]) { // Checa se existe um item_id
            carrinho.itens.push({
                id: row[1],
                produto_id: row[2],
                nome: row[3],
                quantidade: row[4],
                preco_unitario: row[5]
            });
        }
    });

    return carrinho;
};


const createCarrinho = async (cliente_id) => {
    const sql = `INSERT INTO carrinho (cliente_id) VALUES (:cliente_id) RETURNING id INTO :id`;
    const binds = {
        cliente_id,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const result = await execute(sql, binds);
    return { id: result.outBinds.id[0], cliente_id, itens: [] };
};

const addItemAoCarrinho = async (carrinho_id, item) => {
    // Primeiro, busca o preço do produto
    const produtoSql = `SELECT preco FROM produto WHERE id = :produto_id`;
    const produtoResult = await execute(produtoSql, [item.produto_id]);
    if (produtoResult.rows.length === 0) {
        throw new Error("Produto não encontrado");
    }
    const preco_unitario = produtoResult.rows[0][0];

    const sql = `INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade, preco_unitario) 
                 VALUES (:carrinho_id, :produto_id, :quantidade, :preco_unitario)`;
    const binds = { carrinho_id, ...item, preco_unitario };
    await execute(sql, binds);
    return { ...item, preco_unitario };
};

const removeItemDoCarrinho = async (item_id) => {
    const sql = `DELETE FROM item_carrinho WHERE id = :item_id`;
    await execute(sql, [item_id]);
};

module.exports = {
    findCarrinhoByClienteId,
    addItemAoCarrinho,
    removeItemDoCarrinho
};
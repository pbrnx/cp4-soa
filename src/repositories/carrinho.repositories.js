// src/repositories/carrinho.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const { Carrinho, ItemCarrinho } = require('../models/carrinho.model');

async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, { ...options, autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result;
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
}

const findCarrinhoByClienteId = async (cliente_id) => {
    const sql = `SELECT id FROM carrinho WHERE cliente_id = :cliente_id`;
    const result = await execute(sql, [cliente_id]);
    return result.rows.length > 0 ? result.rows[0].ID : null;
};

const createCarrinho = async (cliente_id) => {
    const sql = `INSERT INTO carrinho (cliente_id) VALUES (:cliente_id) RETURNING id INTO :id`;
    const binds = { cliente_id, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
    const result = await execute(sql, binds);
    return result.outBinds.id[0];
};

const getItensByCarrinhoId = async (carrinho_id) => {
    const sql = `
        SELECT ic.id, p.id as produto_id, p.nome as nome_produto, ic.quantidade, ic.preco_unitario
        FROM item_carrinho ic
        JOIN produto p ON ic.produto_id = p.id
        WHERE ic.carrinho_id = :carrinho_id
    `;
    const result = await execute(sql, [carrinho_id]);
    return result.rows.map(row => new ItemCarrinho(row.ID, row.PRODUTO_ID, row.NOME_PRODUTO, row.QUANTIDADE, row.PRECO_UNITARIO));
};

const addItemAoCarrinho = async (carrinho_id, itemData, preco_unitario) => {
    const sql = `INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade, preco_unitario) 
                 VALUES (:carrinho_id, :produto_id, :quantidade, :preco_unitario)`;
    
    // CORREÇÃO: Construímos o objeto 'binds' explicitamente,
    // convertendo os IDs para números com parseInt().
    const binds = {
        carrinho_id: parseInt(carrinho_id, 10),
        produto_id: parseInt(itemData.produto_id, 10),
        quantidade: itemData.quantidade,
        preco_unitario: preco_unitario
    };

    await execute(sql, binds);
};

const removeItemDoCarrinho = async (item_id) => {
    const sql = `DELETE FROM item_carrinho WHERE id = :item_id`;
    const result = await execute(sql, [item_id]);
    return result.rowsAffected;
};

const findItemById = async (item_id) => {
    const sql = `SELECT id FROM item_carrinho WHERE id = :item_id`;
    const result = await execute(sql, [item_id]);
    return result.rows.length > 0;
};


module.exports = {
    findCarrinhoByClienteId,
    createCarrinho,
    getItensByCarrinhoId,
    addItemAoCarrinho,
    removeItemDoCarrinho,
    findItemById
};
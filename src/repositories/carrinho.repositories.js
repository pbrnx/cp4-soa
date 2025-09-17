// src/repositories/carrinho.repositories.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const { Carrinho, ItemCarrinho } = require('../models/carrinho.model');

const findCarrinhoByClienteId = async (cliente_id) => {
    const sql = `SELECT id FROM carrinho WHERE cliente_id = :cliente_id`;
    const result = await execute(sql, [parseInt(cliente_id, 10)]);
    return result.rows.length > 0 ? result.rows[0].ID : null;
};

const createCarrinho = async (cliente_id) => {
    const sql = `INSERT INTO carrinho (cliente_id) VALUES (:cliente_id) RETURNING id INTO :id`;
    const binds = { cliente_id: parseInt(cliente_id, 10), id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
    const result = await execute(sql, binds, { autoCommit: true });
    return result.outBinds.id[0];
};

const getItensByCarrinhoId = async (carrinho_id) => {
    const sql = `
        SELECT ic.id, p.id as produto_id, p.nome as nome_produto, ic.quantidade, ic.preco_unitario
        FROM item_carrinho ic
        JOIN produto p ON ic.produto_id = p.id
        WHERE ic.carrinho_id = :carrinho_id
    `;
    const result = await execute(sql, [parseInt(carrinho_id, 10)]);
    return result.rows.map(row => new ItemCarrinho(row.ID, row.PRODUTO_ID, row.NOME_PRODUTO, row.QUANTIDADE, row.PRECO_UNITARIO));
};

const addItemAoCarrinho = async (carrinho_id, itemData, preco_unitario) => {
    const sql = `INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade, preco_unitario) 
                 VALUES (:carrinho_id, :produto_id, :quantidade, :preco_unitario)`;
    
    const binds = {
        carrinho_id: parseInt(carrinho_id, 10),
        produto_id: parseInt(itemData.produto_id, 10),
        quantidade: itemData.quantidade,
        preco_unitario: preco_unitario
    };

    await execute(sql, binds, { autoCommit: true });
};

const removeItemDoCarrinho = async (item_id) => {
    const sql = `DELETE FROM item_carrinho WHERE id = :item_id`;
    const result = await execute(sql, [parseInt(item_id, 10)], { autoCommit: true });
    return result.rowsAffected;
};

const findItemById = async (item_id) => {
    const sql = `SELECT id FROM item_carrinho WHERE id = :item_id`;
    const result = await execute(sql, [parseInt(item_id, 10)]);
    return result.rows.length > 0;
};

const findCarrinhoById = async (carrinhoId) => {
    const sql = `SELECT * FROM carrinho WHERE id = :id`;
    const result = await execute(sql, [parseInt(carrinhoId, 10)]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.ID, cliente_id: row.CLIENTE_ID };
};

module.exports = {
    findCarrinhoByClienteId,
    createCarrinho,
    getItensByCarrinhoId,
    addItemAoCarrinho,
    removeItemDoCarrinho,
    findItemById,
    findCarrinhoById
};
// src/repositories/produto.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const Produto = require('../models/produto.model');

async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT, // É bom manter por padrão
            autoCommit: true,
            ...options
        });
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
}

const createProduto = async (produtoData) => {
  
    const sql = `INSERT INTO produto (nome, preco, categoria, descricao, ativo) VALUES (:nome, :preco, :categoria, :descricao, :ativo) RETURNING id INTO :id`;
    const binds = {
        ...produtoData,
        ativo: produtoData.ativo !== undefined ? (produtoData.ativo ? 1 : 0) : 1,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const result = await execute(sql, binds);
    const id = result.outBinds.id[0];
    return new Produto(id, produtoData.nome, produtoData.preco, produtoData.categoria, produtoData.descricao, produtoData.ativo);
};

const findAllProdutos = async () => {
    
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO FROM produto`;
    const result = await execute(sql);

    return result.rows.map(row => ({
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO, // Agora DESCRICAO já é uma string
        ativo: !!row.ATIVO
    }));
};

const findProdutoById = async (id) => {
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO FROM produto WHERE id = :id`;
    const result = await execute(sql, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO, // Agora DESCRICAO já é uma string
        ativo: !!row.ATIVO
    };
};

const updateProduto = async (id, produtoData) => {
    const sql = `UPDATE produto SET nome = :nome, preco = :preco, categoria = :categoria, descricao = :descricao, ativo = :ativo WHERE id = :id`;
    const binds = {
        ...produtoData,
        id,
        ativo: produtoData.ativo ? 1 : 0
    };
    await execute(sql, binds);

    return {
        id: parseInt(id, 10),
        ...produtoData
    };
};

const deleteProduto = async (id) => {
    const sql = `DELETE FROM produto WHERE id = :id`;
    await execute(sql, [id]);
};

module.exports = {
    createProduto,
    findAllProdutos,
    findProdutoById,
    updateProduto,
    deleteProduto
};
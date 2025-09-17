// src/repositories/produto.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const Produto = require('../models/produto.model');

async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
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
    // CORREÇÃO: Adicionamos a coluna IMAGEM_URL e o bind :imagem_url
    const sql = `INSERT INTO produto (nome, preco, categoria, descricao, ativo, imagem_url) 
                 VALUES (:nome, :preco, :categoria, :descricao, :ativo, :imagem_url) 
                 RETURNING id INTO :id`;
    
    const binds = {
        nome: produtoData.nome,
        preco: produtoData.preco,
        categoria: produtoData.categoria,
        descricao: produtoData.descricao,
        imagem_url: produtoData.imagem_url || null, // Garante que será null se não for enviado
        ativo: produtoData.ativo !== undefined ? (produtoData.ativo ? 1 : 0) : 1,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const result = await execute(sql, binds);
    const id = result.outBinds.id[0];
    return new Produto(id, produtoData.nome, produtoData.preco, produtoData.categoria, produtoData.descricao, produtoData.ativo, produtoData.imagem_url);
};

const findAllProdutos = async () => {
    // Adicionamos a coluna IMAGEM_URL para ser retornada
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO, IMAGEM_URL FROM produto WHERE ATIVO=1`;
    const result = await execute(sql);

    return result.rows.map(row => ({
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO,
        ativo: !!row.ATIVO,
        imagem_url: row.IMAGEM_URL // Retorna a URL da imagem
    }));
};

const findProdutoById = async (id) => {
    // Adicionamos a coluna IMAGEM_URL
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO, IMAGEM_URL FROM produto WHERE id = :id`;
    const result = await execute(sql, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO,
        ativo: !!row.ATIVO,
        imagem_url: row.IMAGEM_URL // Retorna a URL da imagem
    };
};

const updateProduto = async (id, produtoData) => {
    // CORREÇÃO: Adicionamos a coluna IMAGEM_URL ao UPDATE
    const sql = `UPDATE produto SET 
                    nome = :nome, 
                    preco = :preco, 
                    categoria = :categoria, 
                    descricao = :descricao, 
                    ativo = :ativo,
                    imagem_url = :imagem_url
                 WHERE id = :id`;
    
    const binds = {
        id,
        nome: produtoData.nome,
        preco: produtoData.preco,
        categoria: produtoData.categoria,
        descricao: produtoData.descricao,
        ativo: produtoData.ativo ? 1 : 0,
        imagem_url: produtoData.imagem_url || null // Atualiza a imagem
    };
    await execute(sql, binds);

    return {
        id: parseInt(id, 10),
        ...produtoData
    };
};

const deleteProduto = async (id) => {
    const sql = `UPDATE produto SET ativo = 0 WHERE id = :id`;
    await execute(sql, [id]);
};

const findAllProductsAdmin = async () => {
    // Adicionamos a coluna IMAGEM_URL
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO, IMAGEM_URL FROM produto ORDER BY ID DESC`;
    const result = await execute(sql);

    return result.rows.map(row => ({
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO,
        ativo: !!row.ATIVO,
        imagem_url: row.IMAGEM_URL
    }));
};

const reactivateProduto = async (id) => {
    const sql = `UPDATE produto SET ativo = 1 WHERE id = :id`;
    await execute(sql, [id]);
};

module.exports = {
    createProduto,
    findAllProdutos,
    findProdutoById,
    updateProduto,
    deleteProduto,
    findAllProductsAdmin,
    reactivateProduto
};
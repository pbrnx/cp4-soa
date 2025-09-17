// src/repositories/produto.repositories.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Produto = require('../models/produto.model');


const createProduto = async (produtoData) => {
    const sql = `INSERT INTO produto (nome, preco, categoria, descricao, ativo, imagem_url) 
                 VALUES (:nome, :preco, :categoria, :descricao, :ativo, :imagem_url) 
                 RETURNING id INTO :id`;
    
    const binds = {
        nome: produtoData.nome,
        preco: produtoData.preco,
        categoria: produtoData.categoria,
        descricao: produtoData.descricao,
        imagem_url: produtoData.imagem_url || null,
        ativo: produtoData.ativo !== undefined ? (produtoData.ativo ? 1 : 0) : 1,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    // CORREÇÃO: Adicionado autoCommit para garantir que o INSERT seja salvo.
    const result = await execute(sql, binds, { autoCommit: true });
    const id = result.outBinds.id[0];
    return new Produto(id, produtoData.nome, produtoData.preco, produtoData.categoria, produtoData.descricao, produtoData.ativo, produtoData.imagem_url);
};

const findAllProdutos = async () => {
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO, IMAGEM_URL FROM produto WHERE ATIVO=1`;
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

const findProdutoById = async (id) => {
    const sql = `SELECT ID, NOME, PRECO, CATEGORIA, TO_CHAR(DESCRICAO) AS DESCRICAO, ATIVO, IMAGEM_URL FROM produto WHERE id = :id`;
    // CORREÇÃO: Convertendo ID para número.
    const result = await execute(sql, [parseInt(id, 10)]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: row.ID,
        nome: row.NOME,
        preco: row.PRECO,
        categoria: row.CATEGORIA,
        descricao: row.DESCRICAO,
        ativo: !!row.ATIVO,
        imagem_url: row.IMAGEM_URL
    };
};

const updateProduto = async (id, produtoData) => {
    const sql = `UPDATE produto SET 
                    nome = :nome, 
                    preco = :preco, 
                    categoria = :categoria, 
                    descricao = :descricao, 
                    ativo = :ativo,
                    imagem_url = :imagem_url
                 WHERE id = :id`;
    
    const binds = {
        id: parseInt(id, 10), // CORREÇÃO: Convertendo ID para número.
        nome: produtoData.nome,
        preco: produtoData.preco,
        categoria: produtoData.categoria,
        descricao: produtoData.descricao,
        ativo: produtoData.ativo ? 1 : 0,
        imagem_url: produtoData.imagem_url || null
    };
    // CORREÇÃO: Adicionado autoCommit para garantir que o UPDATE seja salvo.
    await execute(sql, binds, { autoCommit: true });

    return {
        id: parseInt(id, 10),
        ...produtoData
    };
};

const deleteProduto = async (id) => {
    const sql = `UPDATE produto SET ativo = 0 WHERE id = :id`;
    // CORREÇÃO: Adicionado autoCommit e conversão de ID.
    await execute(sql, [parseInt(id, 10)], { autoCommit: true });
};

const findAllProductsAdmin = async () => {
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
    // CORREÇÃO: Adicionado autoCommit e conversão de ID.
    await execute(sql, [parseInt(id, 10)], { autoCommit: true });
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
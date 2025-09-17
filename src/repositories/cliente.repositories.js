// src/repositories/cliente.repositories.js
const oracledb = require('oracledb');
const { execute } = require('../config/database'); 
const Cliente = require('../models/cliente.model');

const createCliente = async (clienteData) => {
    // ... (sem alteração aqui)
    const sql = `INSERT INTO cliente (nome, email, documento) VALUES (:nome, :email, :documento) RETURNING id INTO :id`;
    const binds = { ...clienteData, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
    const result = await execute(sql, binds, { autoCommit: true });
    const id = result.outBinds.id[0];
    return new Cliente(id, clienteData.nome, clienteData.email, clienteData.documento);
};

const findAllClientes = async () => {
    // ... (sem alteração aqui)
    const sql = `SELECT ID, NOME, EMAIL, DOCUMENTO FROM cliente`;
    const result = await execute(sql);
    return result.rows.map(row => ({
        id: row.ID,
        nome: row.NOME,
        email: row.EMAIL,
        documento: row.DOCUMENTO
    }));
};

const findClienteById = async (id) => {
    const sql = `SELECT ID, NOME, EMAIL, DOCUMENTO FROM cliente WHERE id = :id`;
    // CORREÇÃO: Converte o ID para um número antes de executar a query.
    const result = await execute(sql, [parseInt(id, 10)]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
        id: row.ID,
        nome: row.NOME,
        email: row.EMAIL,
        documento: row.DOCUMENTO
    };
};

const updateCliente = async (id, clienteData) => {
    const sql = `UPDATE cliente SET nome = :nome, email = :email, documento = :documento WHERE id = :id`;
    // CORREÇÃO: Garante que o ID no objeto de binds seja um número.
    await execute(sql, { ...clienteData, id: parseInt(id, 10) }, { autoCommit: true });
    return new Cliente(parseInt(id, 10), clienteData.nome, clienteData.email, clienteData.documento);
};

const deleteCliente = async (id) => {
    const sql = `DELETE FROM cliente WHERE id = :id`;
    // CORREÇÃO: Converte o ID para um número.
    await execute(sql, [parseInt(id, 10)], { autoCommit: true });
};

module.exports = {
    createCliente,
    findAllClientes,
    findClienteById,
    updateCliente,
    deleteCliente
};
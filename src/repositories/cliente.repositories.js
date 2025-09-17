// src/repositories/cliente.repositories.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Cliente = require('../models/cliente.model');



const createCliente = async (clienteData) => {
    const sql = `INSERT INTO cliente (nome, email, documento) VALUES (:nome, :email, :documento) RETURNING id INTO :id`;
    const binds = { ...clienteData, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
    const result = await execute(sql, binds);
    const id = result.outBinds.id[0];
    return new Cliente(id, clienteData.nome, clienteData.email, clienteData.documento);
};

const findAllClientes = async () => {
    const sql = `SELECT ID, NOME, EMAIL, DOCUMENTO FROM cliente`;
    const result = await execute(sql);
    // SOLUÇÃO: Criar manualmente objetos puros.
    return result.rows.map(row => ({
        id: row.ID,
        nome: row.NOME,
        email: row.EMAIL,
        documento: row.DOCUMENTO
    }));
};

const findClienteById = async (id) => {
    const sql = `SELECT ID, NOME, EMAIL, DOCUMENTO FROM cliente WHERE id = :id`;
    const result = await execute(sql, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    // SOLUÇÃO: Criar manualmente um objeto puro.
    return {
        id: row.ID,
        nome: row.NOME,
        email: row.EMAIL,
        documento: row.DOCUMENTO
    };
};

const updateCliente = async (id, clienteData) => {
    const sql = `UPDATE cliente SET nome = :nome, email = :email, documento = :documento WHERE id = :id`;
    await execute(sql, { ...clienteData, id });
    return new Cliente(id, clienteData.nome, clienteData.email, clienteData.documento);
};

const deleteCliente = async (id) => {
    const sql = `DELETE FROM cliente WHERE id = :id`;
    await execute(sql, [id]);
};

module.exports = {
    createCliente,
    findAllClientes,
    findClienteById,
    updateCliente,
    deleteCliente
};
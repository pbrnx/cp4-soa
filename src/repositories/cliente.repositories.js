// src/repositories/cliente.repositories.js
const oracledb = require('oracledb');
const { dbConfig } = require('../config/database');
const Cliente = require('../models/cliente.model');

async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, { ...options, autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
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

const createCliente = async (clienteData) => {
    const sql = `INSERT INTO cliente (nome, email, documento) VALUES (:nome, :email, :documento) RETURNING id INTO :id`;
    const binds = {
        ...clienteData,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const result = await execute(sql, binds);
    const id = result.outBinds.id[0];
    return new Cliente(id, clienteData.nome, clienteData.email, clienteData.documento);
};

const findAllClientes = async () => {
    const sql = `SELECT * FROM cliente`;
    const result = await execute(sql);
    return result.rows.map(row => new Cliente(row.ID, row.NOME, row.EMAIL, row.DOCUMENTO));
};

const findClienteById = async (id) => {
    const sql = `SELECT * FROM cliente WHERE id = :id`;
    const result = await execute(sql, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Cliente(row.ID, row.NOME, row.EMAIL, row.DOCUMENTO);
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
// src/config/database.js

const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL
};

let pool;

async function startup() {
  console.log("Iniciando pool de conexões...");
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 5,
      poolTimeout: 60,
    });
    console.log("Pool de conexões iniciado com sucesso.");
  } catch (err) {
    console.error("Erro fatal ao iniciar o pool de conexões:", err);
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Fechando pool de conexões...");
  try {
    if (pool) {
      await pool.close(10);
      console.log("Pool de conexões fechado.");
      pool = null;
    }
  } catch (err) {
    console.error("Erro ao fechar o pool de conexões:", err);
  }
}

async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options
    });
    return result;
  } catch (err) {
    console.error("Erro ao executar query:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao devolver a conexão ao pool:", err);
      }
    }
  }
}

/**
 * Executa uma série de operações como uma transação atômica usando uma conexão do pool.
 * @param {Function} callback A função que recebe a conexão e executa as operações.
 * @returns {Promise<any>} O resultado retornado pela função de callback.
 */
async function executeTransaction(callback) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // CORREÇÃO: A linha "await connection.execute(`BEGIN`);" foi removida.
    // A transação começa automaticamente no primeiro comando DML.

    const result = await callback(connection);

    await connection.commit();
    return result;

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro na transação, rollback executado:", err);
    throw err;

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao devolver a conexão da transação ao pool:", err);
      }
    }
  }
}

module.exports = {
    dbConfig,
    startup,
    shutdown,
    execute,
    executeTransaction
};
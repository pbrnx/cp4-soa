// src/config/database.js

const oracledb = require('oracledb');
require('dotenv').config();

// Configurações de conexão com o Oracle Database
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL
};

// Variável para armazenar a instância do pool
let pool;

/**
 * Inicia o pool de conexões com o banco de dados.
 * Esta função deve ser chamada uma vez quando a aplicação inicia.
 */
async function startup() {
  console.log("Iniciando pool de conexões...");
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      // Número de conexões que o pool tentará manter abertas
      poolMin: 4,
      // Número máximo de conexões que o pool pode ter
      poolMax: 10,
      // Quanto tempo (em segundos) uma conexão pode ficar ociosa no pool antes de ser encerrada.
      poolTimeout: 60,
    });
    console.log("Pool de conexões iniciado com sucesso.");
  } catch (err) {
    console.error("Erro fatal ao iniciar o pool de conexões:", err);
    // Encerra o processo se não conseguir conectar ao banco, pois a API não funcionará.
    process.exit(1);
  }
}

/**
 * Fecha o pool de conexões de forma graciosa.
 * Esta função deve ser chamada quando a aplicação está sendo encerrada.
 */
async function shutdown() {
  console.log("Fechando pool de conexões...");
  try {
    if (pool) {
      await pool.close(10); // Tenta fechar as conexões em 10 segundos
      console.log("Pool de conexões fechado.");
      pool = null;
    }
  } catch (err) {
    console.error("Erro ao fechar o pool de conexões:", err);
  }
}

/**
 * Função genérica para executar queries usando uma conexão do pool.
 * Ela pega uma conexão, executa a query e a devolve ao pool.
 * @param {string} sql A query SQL a ser executada.
 * @param {object|array} binds Os parâmetros para a query.
 * @param {object} options Opções de execução do oracledb.
 * @returns {Promise<object>} O resultado da query.
 */
async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    // 1. Pega uma conexão do pool
    connection = await pool.getConnection();

    // 2. Executa a query
    const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT, // Define o formato de saída padrão
        ...options // Permite sobrescrever opções como autoCommit
    });

    // 3. Retorna o resultado
    return result;

  } catch (err) {
    console.error("Erro ao executar query:", err);
    throw err; // Lança o erro para a camada de serviço/controller tratar
  } finally {
    // 4. Garante que a conexão seja devolvida ao pool
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao devolver a conexão ao pool:", err);
      }
    }
  }
}


// Exporta a configuração, as funções de controle do pool e a função de execução
module.exports = {
    dbConfig,
    startup,
    shutdown,
    execute
};
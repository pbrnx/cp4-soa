// src/config/database.js

const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Configurações de conexão com o Oracle Database
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL
};

// Função para testar a conexão
async function testConnection() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("Conexão com o banco de dados Oracle bem-sucedida!");
    } catch (err) {
        console.error("Erro ao conectar ao banco de dados Oracle:", err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Erro ao fechar a conexão:", err);
            }
        }
    }
}

// Exporta a configuração e a função de teste
module.exports = {
    dbConfig,
    testConnection
};
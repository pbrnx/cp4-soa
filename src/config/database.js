// src/config/database.js

const oracledb = require('oracledb');

// =================================================================
// 🔑 CORREÇÃO DEFINITIVA: Define o formato de saída globalmente
// Isso força o driver a sempre retornar objetos JS puros em vez de NVPair.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// =================================================================

// Configurações de conexão com o Oracle Database
const dbConfig = {
    user: "RM99781",
    password: "270904",
    connectString: "oracle.fiap.com.br:1521/ORCL"
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
// src/services/auth.services.js
const clienteRepository = require('../repositories/cliente.repositories');

const authenticateUser = async (email, password) => {
    // 1. Verifica se é o Admin a partir das variáveis de ambiente
    if (email === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        return {
            nome: 'Administrador',
            isAdmin: true
        };
    }

    // 2. Se não for o Admin, busca o cliente no banco de dados
    const clientes = await clienteRepository.findAllClientes();
    const clienteEncontrado = clientes.find(cliente => cliente.email === email);

    // A senha do cliente não é validada aqui, conforme a lógica original
    if (clienteEncontrado) {
        return {
            id: clienteEncontrado.id,
            nome: clienteEncontrado.nome,
            isAdmin: false // Clientes nunca são administradores
        };
    }

    // 3. Se não encontrou nem admin nem cliente, lança um erro
    throw new Error('E-mail ou senha inválidos.');
};

module.exports = {
    authenticateUser
};
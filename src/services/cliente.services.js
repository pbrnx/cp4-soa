// src/services/cliente.services.js
const clienteRepository = require('../repositories/cliente.repositories');

const createCliente = async (clienteData) => {
    // ATUALIZAÇÃO: Validações de negócio adicionadas
    if (!clienteData.nome || !clienteData.email || !clienteData.documento) {
        throw new Error("Os campos 'nome', 'email' e 'documento' são obrigatórios.");
    }
    return await clienteRepository.createCliente(clienteData);
};

const getAllClientes = async () => {
    return await clienteRepository.findAllClientes();
};

const getClienteById = async (id) => {
    const cliente = await clienteRepository.findClienteById(id);
    if (!cliente) {
        return null;
    }
    return cliente;
};

const updateCliente = async (id, clienteData) => {
    if (!clienteData.nome || !clienteData.email || !clienteData.documento) {
        throw new Error("Os campos 'nome', 'email' e 'documento' são obrigatórios.");
    }

    const clienteExistente = await clienteRepository.findClienteById(id);
    if (!clienteExistente) {
        throw new Error("Cliente não encontrado para atualização.");
    }
    return await clienteRepository.updateCliente(id, clienteData);
};

const deleteCliente = async (id) => {
    const clienteExistente = await clienteRepository.findClienteById(id);
    if (!clienteExistente) {
        throw new Error("Cliente não encontrado para exclusão.");
    }
    return await clienteRepository.deleteCliente(id);
};

module.exports = {
    createCliente,
    getAllClientes,
    getClienteById,
    updateCliente,
    deleteCliente
};
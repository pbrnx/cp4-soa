// src/services/cliente.services.js
const clienteRepository = require('../repositories/cliente.repositories');

const createCliente = async (clienteData) => {
    // Futuramente, aqui podem entrar regras de negócio.
    // Ex: Validar se o formato do 'documento' é de CPF ou CNPJ.
    return await clienteRepository.createCliente(clienteData);
};

const getAllClientes = async () => {
    return await clienteRepository.findAllClientes();
};

const getClienteById = async (id) => {
    const cliente = await clienteRepository.findClienteById(id);
    if (!cliente) {
        // A camada de serviço decide o que fazer em caso de não encontrar.
        // Lançar um erro customizado seria uma boa prática.
        return null;
    }
    return cliente;
};

const updateCliente = async (id, clienteData) => {
    // Regra de negócio: verificar se o cliente existe antes de atualizar.
    const clienteExistente = await clienteRepository.findClienteById(id);
    if (!clienteExistente) {
        throw new Error("Cliente não encontrado para atualização.");
    }
    return await clienteRepository.updateCliente(id, clienteData);
};

const deleteCliente = async (id) => {
     // Regra de negócio: verificar se o cliente existe antes de deletar.
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
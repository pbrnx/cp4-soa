// src/controllers/cliente.controller.js
const clienteService = require('../services/cliente.services');

const createCliente = async (req, res) => {
    try {
        const novoCliente = await clienteService.createCliente(req.body);
        res.status(201).json(novoCliente);
    } catch (error) {
        console.error("Erro em createCliente:", error);
        res.status(400).json({ message: error.message });
    }
};

const getAllClientes = async (req, res) => {
    try {
        const clientes = await clienteService.getAllClientes();
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Erro em getAllClientes:", error);
        res.status(500).json({ message: "Erro ao buscar clientes" });
    }
};

const getClienteById = async (req, res) => {
    try {
        const cliente = await clienteService.getClienteById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente não encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        console.error("Erro em getClienteById:", error);
        res.status(500).json({ message: "Erro ao buscar cliente" });
    }
};

const updateCliente = async (req, res) => {
    try {
        const clienteAtualizado = await clienteService.updateCliente(req.params.id, req.body);
        res.status(200).json(clienteAtualizado);
    } catch (error) {
        console.error("Erro em updateCliente:", error);
        res.status(404).json({ message: error.message });
    }
};

const deleteCliente = async (req, res) => {
    try {
        await clienteService.deleteCliente(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em deleteCliente:", error);
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    createCliente,
    getAllClientes,
    getClienteById,
    updateCliente,
    deleteCliente
};
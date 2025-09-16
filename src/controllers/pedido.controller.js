// src/controllers/pedido.controller.js
const pedidoRepository = require('../repositories/pedido.repositories');

const createPedido = async (req, res) => {
    try {
        const { carrinhoId } = req.body;
        if (!carrinhoId) {
            return res.status(400).json({ message: "O ID do carrinho é obrigatório." });
        }
        const novoPedido = await pedidoRepository.createPedidoFromCarrinho(carrinhoId);
        res.status(201).json(novoPedido);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar pedido", error: error.message });
    }
};

const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoRepository.findAllPedidos();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar pedidos", error: error.message });
    }
};

const getPedidoById = async (req, res) => {
    try {
        const pedido = await pedidoRepository.findPedidoById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ message: "Pedido não encontrado" });
        }
        res.status(200).json(pedido);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar pedido", error: error.message });
    }
};

module.exports = {
    createPedido,
    getAllPedidos,
    getPedidoById
};
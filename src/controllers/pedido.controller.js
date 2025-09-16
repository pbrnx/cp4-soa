// src/controllers/pedido.controller.js
const pedidoService = require('../services/pedido.services');

const createPedido = async (req, res) => {
    try {
        const { carrinhoId } = req.body;
        if (!carrinhoId) {
            return res.status(400).json({ message: "O ID do carrinho é obrigatório." });
        }
        const novoPedido = await pedidoService.createPedido(carrinhoId);
        res.status(201).json(novoPedido);
    } catch (error) {
        console.error("Erro em createPedido:", error);
        res.status(400).json({ message: error.message });
    }
};

const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoService.getAllPedidos();
        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Erro em getAllPedidos:", error);
        res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
};

const getPedidoById = async (req, res) => {
    try {
        const pedido = await pedidoService.getPedidoById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ message: "Pedido não encontrado" });
        }
        res.status(200).json(pedido);
    } catch (error) {
        console.error("Erro em getPedidoById:", error);
        res.status(500).json({ message: "Erro ao buscar pedido" });
    }
};

module.exports = {
    createPedido,
    getAllPedidos,
    getPedidoById
};
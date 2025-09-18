//src/controllers/pedido.controller.js

const pedidoService = require('../services/pedido.services');

const { PedidoResponseDTO } = require('../dtos/pedido.dtos');

const createPedido = async (req, res) => {
    try {
        const { carrinhoId } = req.body;
        if (!carrinhoId) {
            return res.status(400).json({ message: "O ID do carrinho é obrigatório." });
        }
        const novoPedido = await pedidoService.createPedido(carrinhoId);
        // 2. MAPEIE O RESULTADO PARA O DTO
        const pedidoResponse = new PedidoResponseDTO(novoPedido);
        res.status(201).json(pedidoResponse);
    } catch (error) {
        console.error("Erro em createPedido:", error);
        res.status(400).json({ message: error.message });
    }
};

const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoService.getAllPedidos();
    
        const pedidosResponse = pedidos.map(pedido => new PedidoResponseDTO(pedido));
        res.status(200).json(pedidosResponse);
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
        // 2. MAPEIE O RESULTADO PARA O DTO
        const pedidoResponse = new PedidoResponseDTO(pedido);
        res.status(200).json(pedidoResponse);
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
// src/controllers/pagamento.controller.js
const pagamentoService = require('../services/pagamento.services');

const createPagamento = async (req, res) => {
    try {
        // Espera no corpo da requisição: { pedido_id, metodo }
        const novoPagamento = await pagamentoService.createPagamento(req.body);
        res.status(201).json(novoPagamento);
    } catch (error) {
        console.error("Erro em createPagamento:", error);
        res.status(400).json({ message: error.message });
    }
};

const getPagamentoByPedidoId = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const pagamento = await pagamentoService.getPagamentoByPedidoId(pedidoId);
        if (!pagamento) {
            return res.status(404).json({ message: "Pagamento não encontrado para este pedido." });
        }
        res.status(200).json(pagamento);
    } catch (error) {
        console.error("Erro em getPagamentoByPedidoId:", error);
        res.status(500).json({ message: "Erro ao buscar pagamento" });
    }
};

module.exports = {
    createPagamento,
    getPagamentoByPedidoId
};
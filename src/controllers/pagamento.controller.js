// src/controllers/pagamento.controller.js
const pagamentoRepository = require('../repositories/pagamento.repositories');

const createPagamento = async (req, res) => {
    try {
        const novoPagamento = await pagamentoRepository.createPagamento(req.body);
        res.status(201).json(novoPagamento);
    } catch (error) {
        res.status(500).json({ message: "Erro ao processar pagamento", error: error.message });
    }
};

const getPagamentoByPedidoId = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const pagamento = await pagamentoRepository.findPagamentoByPedidoId(pedidoId);
        if (!pagamento) {
            return res.status(404).json({ message: "Pagamento não encontrado para este pedido." });
        }
        res.status(200).json(pagamento);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar pagamento", error: error.message });
    }
};

module.exports = {
    createPagamento,
    getPagamentoByPedidoId
};
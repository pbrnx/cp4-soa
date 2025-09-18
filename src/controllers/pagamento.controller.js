// src/controllers/pagamento.controller.js

const pagamentoService = require('../services/pagamento.services');

const { PagamentoResponseDTO } = require('../dtos/pagamento.dtos');

const createPagamento = async (req, res) => {
    try {
        const novoPagamento = await pagamentoService.createPagamento(req.body);
        // 2. MAPEIE O RESULTADO PARA O DTO
        const pagamentoResponse = new PagamentoResponseDTO(novoPagamento);
        res.status(201).json(pagamentoResponse);
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

        const pagamentoResponse = new PagamentoResponseDTO(pagamento);
        res.status(200).json(pagamentoResponse);
    } catch (error) {
        console.error("Erro em getPagamentoByPedidoId:", error);
        res.status(500).json({ message: "Erro ao buscar pagamento" });
    }
};

module.exports = {
    createPagamento,
    getPagamentoByPedidoId
};
// src/services/pagamento.services.js
const pagamentoRepository = require('../repositories/pagamento.repositories');
const pedidoRepository = require('../repositories/pedido.repositories'); // Para validar o pedido

const createPagamento = async (pagamentoData) => {
    // Regra de negócio: verificar se o pedido existe
    const pedido = await pedidoRepository.findPedidoById(pagamentoData.pedido_id);
    if (!pedido) {
        throw new Error("Pedido não encontrado.");
    }

    // Regra de negócio: verificar se o pedido já foi pago
    if (pedido.status !== 'CRIADO') {
        throw new Error(`Este pedido não pode ser pago (Status atual: ${pedido.status}).`);
    }

    // Regra de negócio: verificar se já existe um pagamento para este pedido
    const pagamentoExistente = await pagamentoRepository.findPagamentoByPedidoId(pagamentoData.pedido_id);
    if (pagamentoExistente) {
        throw new Error("Já existe um pagamento registrado para este pedido.");
    }

    return await pagamentoRepository.createPagamento(pagamentoData, pedido.total);
};

const getPagamentoByPedidoId = async (pedidoId) => {
    return await pagamentoRepository.findPagamentoByPedidoId(pedidoId);
};

module.exports = {
    createPagamento,
    getPagamentoByPedidoId
};
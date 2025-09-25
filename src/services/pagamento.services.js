//src/services/pagamento.services.js

const pagamentoRepository = require('../repositories/pagamento.repositories');
const pedidoRepository = require('../repositories/pedido.repositories');
const carrinhoRepository = require('../repositories/carrinho.repositories'); // 1. IMPORTADO

const createPagamento = async (pagamentoData) => {
    // Validações de método de pagamento e do pedido (permanecem iguais)
    const metodosPermitidos = ['PIX', 'Cartão de Crédito', 'Boleto'];
    if (!pagamentoData.metodo || !metodosPermitidos.includes(pagamentoData.metodo)) {
        throw new Error(`Método de pagamento inválido. Os métodos aceitos são: ${metodosPermitidos.join(', ')}.`);
    }

    const pedido = await pedidoRepository.findPedidoById(pagamentoData.pedido_id);
    if (!pedido) {
        throw new Error("Pedido não encontrado.");
    }

    if (pedido.status !== 'CRIADO') {
        throw new Error(`Este pedido não pode ser pago (Status atual: ${pedido.status}).`);
    }

    const pagamentoExistente = await pagamentoRepository.findPagamentoByPedidoId(pagamentoData.pedido_id);
    if (pagamentoExistente) {
        throw new Error("Já existe um pagamento registrado para este pedido.");
    }
    
    pagamentoData.metodo = pagamentoData.metodo.toUpperCase();

    // Cria o pagamento
    const pagamento = await pagamentoRepository.createPagamento(pagamentoData, pedido.total);

    // 2. LÓGICA DE LIMPEZA DO CARRINHO MOVIDA PARA CÁ
    // Após o pagamento ser bem-sucedido, encontramos o carrinho do cliente e o limpamos.
    const carrinhoId = await carrinhoRepository.findCarrinhoByClienteId(pedido.cliente_id);
    if (carrinhoId) {
        await carrinhoRepository.clearCarrinhoById(carrinhoId);
    }
    
    return pagamento;
};

const getPagamentoByPedidoId = async (pedidoId) => {
    return await pagamentoRepository.findPagamentoByPedidoId(pedidoId);
};

module.exports = {
    createPagamento,
    getPagamentoByPedidoId
};
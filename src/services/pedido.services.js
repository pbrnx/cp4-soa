// src/services/pedido.services.js
const pedidoRepository = require('../repositories/pedido.repositories');
const carrinhoService = require('./carrinho.services');

const createPedido = async (carrinhoId) => {
    const carrinho = await carrinhoService.getCarrinhoById(carrinhoId);
    
    if (!carrinho || carrinho.itens.length === 0) {
        throw new Error("O carrinho está vazio ou não existe.");
    }

    return await pedidoRepository.createPedidoFromCarrinho(carrinho);
};

const getAllPedidos = async () => {
    return await pedidoRepository.findAllPedidos();
};

const getPedidoById = async (id) => {
    const pedido = await pedidoRepository.findPedidoById(id);
    if (!pedido) {
        return null;
    }
    return pedido;
};


const updatePedidoStatus = async (id, status) => {
    const pedido = await pedidoRepository.findPedidoById(id);
    if (!pedido) {
        throw new Error("Pedido não encontrado.");
    }

    // Valida se o status enviado é um dos permitidos
    const allowedStatus = ['CRIADO', 'PAGO', 'CANCELADO'];
    if (!status || !allowedStatus.includes(status.toUpperCase())) {
        throw new Error(`Status inválido. Use um dos seguintes: ${allowedStatus.join(', ')}`);
    }

    await pedidoRepository.updateStatus(id, status.toUpperCase());
    
    // Retorna o objeto do pedido com o status já atualizado para o controller
    pedido.status = status.toUpperCase();
    return pedido;
};

module.exports = {
    createPedido,
    getAllPedidos,
    getPedidoById,
    updatePedidoStatus // Exporta a nova função
};
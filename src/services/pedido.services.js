// src/services/pedido.services.js
const pedidoRepository = require('../repositories/pedido.repositories');
const carrinhoService = require('./carrinho.services'); // Reutiliza o serviço de carrinho

const createPedido = async (carrinhoId) => {
    // Busca o carrinho e seus itens usando o carrinhoId.
    // Primeiro, precisamos de uma forma de buscar um carrinho pelo seu ID.
    // Vamos assumir que a função getCarrinhoById exista no carrinhoService.
    const carrinho = await carrinhoService.getCarrinhoById(carrinhoId); // Esta função precisa ser criada
    
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
        return null; // O controller irá tratar o 404
    }
    return pedido;
};

module.exports = {
    createPedido,
    getAllPedidos,
    getPedidoById
};

// NOTA: Para o código acima funcionar, o `carrinho.services.js` precisará de uma nova função
// `getCarrinhoById` que busca um carrinho e seu cliente_id pelo ID do carrinho.
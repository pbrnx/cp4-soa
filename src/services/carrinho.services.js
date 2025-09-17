// src/services/carrinho.services.js
const carrinhoRepository = require('../repositories/carrinho.repositories');
const produtoRepository = require('../repositories/produto.repositories');
const clienteRepository = require('../repositories/cliente.repositories');
const { Carrinho } = require('../models/carrinho.model');

// ... (as funções getCarrinhoByClienteId e getCarrinhoById não mudam)

const getCarrinhoByClienteId = async (clienteId) => {
    const cliente = await clienteRepository.findClienteById(clienteId);
    if (!cliente) {
        throw new Error("Cliente não encontrado.");
    }
    let carrinhoId = await carrinhoRepository.findCarrinhoByClienteId(clienteId);
    if (!carrinhoId) {
        carrinhoId = await carrinhoRepository.createCarrinho(clienteId);
    }
    const carrinho = new Carrinho(carrinhoId, clienteId);
    const itens = await carrinhoRepository.getItensByCarrinhoId(carrinhoId);
    itens.forEach(item => carrinho.adicionarItem(item));
    return carrinho;
};

const getCarrinhoById = async (carrinhoId) => {
    const carrinhoInfo = await carrinhoRepository.findCarrinhoById(carrinhoId); 
    if (!carrinhoInfo) {
        throw new Error("Carrinho não encontrado.");
    }
    const carrinho = new Carrinho(carrinhoInfo.id, carrinhoInfo.cliente_id);
    const itens = await carrinhoRepository.getItensByCarrinhoId(carrinhoId);
    itens.forEach(item => carrinho.adicionarItem(item));
    return carrinho;
}

const addItem = async (carrinhoId, itemData) => {
    const produto = await produtoRepository.findProdutoById(itemData.produto_id);
    if (!produto) {
        throw new Error("Produto não encontrado.");
    }
    if (!produto.ativo) {
        throw new Error("Produto não está disponível para venda.");
    }
    if (itemData.quantidade <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
    }
    const itemExistente = await carrinhoRepository.findItemByCarrinhoAndProduto(carrinhoId, itemData.produto_id);
    if (itemExistente) {
        const novaQuantidade = itemExistente.QUANTIDADE + itemData.quantidade;
        await carrinhoRepository.updateItemQuantidade(itemExistente.ID, novaQuantidade);
    } else {
        await carrinhoRepository.insertItemNoCarrinho(carrinhoId, itemData, produto.preco);
    }
    return getCarrinhoById(carrinhoId);
};

// **NOVA FUNÇÃO ADICIONADA**
const updateItemQuantidade = async (itemId, novaQuantidade) => {
    const itemExists = await carrinhoRepository.findItemById(itemId);
    if (!itemExists) {
        throw new Error("Item não encontrado no carrinho.");
    }

    if (novaQuantidade > 0) {
        await carrinhoRepository.updateItemQuantidade(itemId, novaQuantidade);
    } else {
        // Se a nova quantidade for 0 ou menos, removemos o item
        await carrinhoRepository.removeItemDoCarrinho(itemId);
    }
};

const removeItem = async (itemId) => {
    const itemExists = await carrinhoRepository.findItemById(itemId);
    if (!itemExists) {
        throw new Error("Item não encontrado no carrinho.");
    }
    await carrinhoRepository.removeItemDoCarrinho(itemId);
};

module.exports = {
    getCarrinhoByClienteId,
    addItem,
    removeItem,
    getCarrinhoById,
    updateItemQuantidade // <- Exporta a nova função
};
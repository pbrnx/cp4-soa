// Substitua o conteúdo de src/services/carrinho.services.js por este

const carrinhoRepository = require('../repositories/carrinho.repositories');
const produtoRepository = require('../repositories/produto.repositories');
const clienteRepository = require('../repositories/cliente.repositories');
const { Carrinho } = require('../models/carrinho.model');

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
    // CORREÇÃO: Agora usa a função do repositório que utiliza o pool.
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

    await carrinhoRepository.addItemAoCarrinho(carrinhoId, itemData, produto.preco);

    // Retorna o carrinho atualizado
    return getCarrinhoById(carrinhoId);
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
    getCarrinhoById
};
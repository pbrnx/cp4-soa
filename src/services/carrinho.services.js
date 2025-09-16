// src/services/carrinho.services.js
const carrinhoRepository = require('../repositories/carrinho.repositories');
const produtoRepository = require('../repositories/produto.repositories'); // Para buscar info do produto
const clienteRepository = require('../repositories/cliente.repositories'); // Para validar cliente
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
    const carrinho = await getCarrinhoByClienteId((await findCarrinhoById(carrinhoId)).cliente_id); // precisa de uma função para achar o cliente id pelo carrinho id
    return carrinho;
};

const removeItem = async (itemId) => {
    const itemExists = await carrinhoRepository.findItemById(itemId);
    if (!itemExists) {
        throw new Error("Item não encontrado no carrinho.");
    }
    await carrinhoRepository.removeItemDoCarrinho(itemId);
};

// Helper function para encontrar carrinho pelo id (pode ser movida para o repo se necessário)
async function findCarrinhoById(carrinhoId) {
    const conn = await require('oracledb').getConnection(require('../config/database').dbConfig);
    const result = await conn.execute(`SELECT * FROM carrinho WHERE id = :id`, [carrinhoId], { outFormat: require('oracledb').OUT_FORMAT_OBJECT });
    await conn.close();
    if(result.rows.length === 0) throw new Error("Carrinho não encontrado.");
    return { id: result.rows[0].ID, cliente_id: result.rows[0].CLIENTE_ID };
}


module.exports = {
    getCarrinhoByClienteId,
    addItem,
    removeItem
};  
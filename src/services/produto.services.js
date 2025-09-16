// src/services/produto.services.js
const produtoRepository = require('../repositories/produto.repositories');

const createProduto = async (produtoData) => {
    // Regra de negócio: O preço de um produto não pode ser negativo.
    if (produtoData.preco < 0) {
        throw new Error("O preço do produto não pode ser negativo.");
    }
    const novoProduto = await produtoRepository.createProduto(produtoData);
    // Garante que o retorno seja um objeto simples
    return JSON.parse(JSON.stringify(novoProduto));
};

const getAllProdutos = async () => {
    const produtos = await produtoRepository.findAllProdutos();
    // Garante que o retorno seja um array de objetos simples
    return JSON.parse(JSON.stringify(produtos));
};

const getProdutoById = async (id) => {
    const produto = await produtoRepository.findProdutoById(id);
    // Garante que o retorno seja um objeto simples
    return JSON.parse(JSON.stringify(produto));
};

const updateProduto = async (id, produtoData) => {
    const produtoExistente = await produtoRepository.findProdutoById(id);
    if (!produtoExistente) {
        throw new Error("Produto não encontrado para atualização.");
    }
    if (produtoData.preco < 0) {
        throw new Error("O preço do produto não pode ser negativo.");
    }
    const produtoAtualizado = await produtoRepository.updateProduto(id, produtoData);
    // Garante que o retorno seja um objeto simples
    return JSON.parse(JSON.stringify(produtoAtualizado));
};

const deleteProduto = async (id) => {
    const produtoExistente = await produtoRepository.findProdutoById(id);
    if (!produtoExistente) {
        throw new Error("Produto não encontrado para exclusão.");
    }
    return await produtoRepository.deleteProduto(id);
};

module.exports = {
    createProduto,
    getAllProdutos,
    getProdutoById,
    updateProduto,
    deleteProduto
};
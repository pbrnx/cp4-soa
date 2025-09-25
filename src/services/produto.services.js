// src/services/produto.services.js
const produtoRepository = require('../repositories/produto.repositories');

const createProduto = async (produtoData) => {

    if (!produtoData.nome || produtoData.preco === undefined || !produtoData.categoria) {
        throw new Error("Os campos 'nome', 'preco' e 'categoria' são obrigatórios.");
    }
    if (produtoData.preco < 0) {
        throw new Error("O preço do produto não pode ser negativo.");
    }
    return await produtoRepository.createProduto(produtoData);
};

const getAllProdutos = async () => {
    return await produtoRepository.findAllProdutos();
};

const getProdutoById = async (id) => {
    return await produtoRepository.findProdutoById(id);
};

const updateProduto = async (id, produtoData) => {
    const produtoExistente = await produtoRepository.findProdutoById(id);
    if (!produtoExistente) {
        throw new Error("Produto não encontrado para atualização.");
    }
    

    if (!produtoData.nome || produtoData.preco === undefined || !produtoData.categoria) {
        throw new Error("Os campos 'nome', 'preco' e 'categoria' são obrigatórios.");
    }
    if (produtoData.preco < 0) {
        throw new Error("O preço do produto não pode ser negativo.");
    }
    return await produtoRepository.updateProduto(id, produtoData);
};

const deleteProduto = async (id) => {
    const produtoExistente = await produtoRepository.findProdutoById(id);
    if (!produtoExistente) {
        throw new Error("Produto não encontrado para exclusão.");
    }
    return await produtoRepository.deleteProduto(id);
};

const getAllProdutosAdmin = async () => {
    return await produtoRepository.findAllProductsAdmin();
};

const reactivateProduto = async (id) => {
    const produtoExistente = await produtoRepository.findProdutoById(id);
    if (!produtoExistente) {
        throw new Error("Produto não encontrado para reativação.");
    }
    return await produtoRepository.reactivateProduto(id);
};

module.exports = {
    createProduto,
    getAllProdutos,
    getProdutoById,
    updateProduto,
    deleteProduto,
    getAllProdutosAdmin,
    reactivateProduto
};
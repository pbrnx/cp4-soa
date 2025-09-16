// src/controllers/produto.controller.js
const produtoService = require('../services/produto.services');

const createProduto = async (req, res) => {
    try {
        const novoProduto = await produtoService.createProduto(req.body);
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error("Erro em createProduto:", error);
        res.status(400).json({ message: error.message });
    }
};

const getAllProdutos = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutos();
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro em getAllProdutos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos" });
    }
};

const getProdutoById = async (req, res) => {
    try {
        const produto = await produtoService.getProdutoById(req.params.id);
        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.status(200).json(produto);
    } catch (error) {
        console.error("Erro em getProdutoById:", error);
        res.status(500).json({ message: "Erro ao buscar produto" });
    }
};

const updateProduto = async (req, res) => {
    try {
        const produtoAtualizado = await produtoService.updateProduto(req.params.id, req.body);
        res.status(200).json(produtoAtualizado);
    } catch (error) {
        console.error("Erro em updateProduto:", error);
        res.status(404).json({ message: error.message });
    }
};

const deleteProduto = async (req, res) => {
    try {
        await produtoService.deleteProduto(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em deleteProduto:", error);
        res.status(404).json({ message: error.message });
    }
};

// Adicione esta nova função
const getAllProdutosAdmin = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutosAdmin();
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro em getAllProdutosAdmin:", error);
        res.status(500).json({ message: "Erro ao buscar produtos para admin" });
    }
};

// E esta também
const reactivateProduto = async (req, res) => {
    try {
        await produtoService.reactivateProduto(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em reactivateProduto:", error);
        res.status(404).json({ message: error.message });
    }
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
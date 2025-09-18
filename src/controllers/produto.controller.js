// src/controllers/produto.controller.js

const produtoService = require('../services/produto.services');

const { ProdutoResponseDTO } = require('../dtos/produto.dtos');

const createProduto = async (req, res) => {
    try {
        const produtoData = req.body;
        if (req.file) {
            produtoData.imagem_url = `/uploads/${req.file.filename}`;
        }
        const novoProduto = await produtoService.createProduto(produtoData);
      
        const produtoResponse = new ProdutoResponseDTO(novoProduto);
        res.status(201).json(produtoResponse);
    } catch (error) {
        console.error("Erro em createProduto:", error);
        res.status(400).json({ message: error.message });
    }
};

const getAllProdutos = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutos();

        const produtosResponse = produtos.map(produto => new ProdutoResponseDTO(produto));
        res.status(200).json(produtosResponse);
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

        const produtoResponse = new ProdutoResponseDTO(produto);
        res.status(200).json(produtoResponse);
    } catch (error) {
        console.error("Erro em getProdutoById:", error);
        res.status(500).json({ message: "Erro ao buscar produto" });
    }
};

const updateProduto = async (req, res) => {
    try {
        const produtoData = req.body;
        if (req.file) {
            produtoData.imagem_url = `/uploads/${req.file.filename}`;
        }
        const produtoAtualizado = await produtoService.updateProduto(req.params.id, produtoData);

        const produtoResponse = new ProdutoResponseDTO(produtoAtualizado);
        res.status(200).json(produtoResponse);
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

const reactivateProduto = async (req, res) => {
    try {
        await produtoService.reactivateProduto(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em reactivateProduto:", error);
        res.status(404).json({ message: error.message });
    }
};


// Rota de admin também deve retornar o DTO
const getAllProdutosAdmin = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutosAdmin();
        // 2. MAPEIE A LISTA PARA O DTO
        const produtosResponse = produtos.map(produto => new ProdutoResponseDTO(produto));
        res.status(200).json(produtosResponse);
    } catch (error) {
        console.error("Erro em getAllProdutosAdmin:", error);
        res.status(500).json({ message: "Erro ao buscar produtos para admin" });
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
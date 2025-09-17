// src/controllers/produto.controller.js
const produtoService = require('../services/produto.services');

/**
 * Cria um novo produto. Se uma imagem for enviada, ela é associada ao produto.
 */
const createProduto = async (req, res) => {
    try {
        // req.body contém os campos de texto (nome, preco, etc.)
        const produtoData = req.body;

        // Se um arquivo foi enviado pelo multer, o objeto req.file existirá
        if (req.file) {
            // Construímos a URL pública para a imagem salva na pasta 'static/uploads'
            produtoData.imagem_url = `/uploads/${req.file.filename}`;
        }

        const novoProduto = await produtoService.createProduto(produtoData);
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error("Erro em createProduto:", error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtém todos os produtos ativos para a loja.
 */
const getAllProdutos = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutos();
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro em getAllProdutos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos" });
    }
};

/**
 * Obtém um produto específico pelo seu ID.
 */
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

/**
 * Atualiza um produto. Se uma nova imagem for enviada, ela substitui a antiga.
 */
const updateProduto = async (req, res) => {
    try {
        const produtoData = req.body;

        // Verifica se uma nova imagem foi enviada na atualização
        if (req.file) {
            produtoData.imagem_url = `/uploads/${req.file.filename}`;
        }

        const produtoAtualizado = await produtoService.updateProduto(req.params.id, produtoData);
        res.status(200).json(produtoAtualizado);
    } catch (error) {
        console.error("Erro em updateProduto:", error);
        res.status(404).json({ message: error.message });
    }
};

/**
 * Desativa um produto (soft delete).
 */
const deleteProduto = async (req, res) => {
    try {
        await produtoService.deleteProduto(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em deleteProduto:", error);
        res.status(404).json({ message: error.message });
    }
};

/**
 * Obtém TODOS os produtos (ativos e inativos) para o painel de admin.
 */
const getAllProdutosAdmin = async (req, res) => {
    try {
        const produtos = await produtoService.getAllProdutosAdmin();
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro em getAllProdutosAdmin:", error);
        res.status(500).json({ message: "Erro ao buscar produtos para admin" });
    }
};

/**
 * Reativa um produto que foi desativado.
 */
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
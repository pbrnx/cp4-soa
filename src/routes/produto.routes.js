// src/routes/produto.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller');
const upload = require('../config/upload'); // Importe a configuração do multer

// ROTAS DE ADMIN
// Rota para o painel de admin buscar TODOS os produtos (não precisa de upload)
router.get('/admin', produtoController.getAllProdutosAdmin);

// Rota para reativar um produto (não precisa de upload)
router.patch('/:id/reactivate', produtoController.reactivateProduto);


// ROTAS PRINCIPAIS DA API

// Criar um novo produto - ADICIONADO O MIDDLEWARE DE UPLOAD
router.post('/', upload.single('imagem'), produtoController.createProduto);

// Obter todos os produtos para a loja
router.get('/', produtoController.getAllProdutos);

// Obter um produto específico pelo seu ID
router.get('/:id', produtoController.getProdutoById);

// Atualizar um produto - ADICIONADO O MIDDLEWARE DE UPLOAD
router.put('/:id', upload.single('imagem'), produtoController.updateProduto);

// Desativar (soft delete) um produto
router.delete('/:id', produtoController.deleteProduto);

module.exports = router;
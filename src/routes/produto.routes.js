// src/routes/produto.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller');

// Rota para o painel de admin buscar TODOS os produtos
router.get('/admin', produtoController.getAllProdutosAdmin);

// Rota para reativar um produto
router.patch('/:id/reactivate', produtoController.reactivateProduto);


router.post('/', produtoController.createProduto);
router.get('/', produtoController.getAllProdutos);
router.get('/:id', produtoController.getProdutoById);
router.put('/:id', produtoController.updateProduto);
router.delete('/:id', produtoController.deleteProduto);

module.exports = router;
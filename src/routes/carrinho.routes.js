// src/routes/carrinho.routes.js
const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinho.controller');

// Obter o carrinho de um cliente (cria se não existir)
router.get('/cliente/:clienteId', carrinhoController.getCarrinho);

// Adicionar um item a um carrinho específico
router.post('/:carrinhoId/items', carrinhoController.addItem);

// **NOVA ROTA ADICIONADA**
// Atualizar a quantidade de um item específico
router.put('/items/:itemId', carrinhoController.updateItem);

// Remover um item específico do carrinho
router.delete('/items/:itemId', carrinhoController.removeItem);

module.exports = router;
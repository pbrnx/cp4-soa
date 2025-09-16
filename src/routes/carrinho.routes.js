// src/routes/carrinho.routes.js
const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinho.controller');

// Obter o carrinho de um cliente
router.get('/cliente/:clienteId', carrinhoController.getCarrinho);

// Adicionar um item ao carrinho
router.post('/:carrinhoId/items', carrinhoController.addItem);

// Remover um item do carrinho
router.delete('/items/:itemId', carrinhoController.removeItem);


module.exports = router;
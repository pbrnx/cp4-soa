// src/routes/pedido.routes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// Criar um novo pedido a partir de um carrinho
router.post('/', pedidoController.createPedido);

// Obter todos os pedidos
router.get('/', pedidoController.getAllPedidos);

// Obter um pedido pelo ID
router.get('/:id', pedidoController.getPedidoById);

module.exports = router;
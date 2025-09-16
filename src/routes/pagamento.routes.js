// src/routes/pagamento.routes.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamento.controller');

// Processar o pagamento de um pedido
router.post('/', pagamentoController.createPagamento);

// Obter o status de pagamento de um pedido
router.get('/pedido/:pedidoId', pagamentoController.getPagamentoByPedidoId);

module.exports = router;
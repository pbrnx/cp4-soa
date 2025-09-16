// src/routes/cliente.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');

router.post('/', clienteController.createCliente);
router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
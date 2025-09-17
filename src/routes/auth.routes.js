// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota para processar o login de clientes e do admin
router.post('/login', authController.login);

module.exports = router;
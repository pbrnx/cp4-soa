// src/controllers/auth.controller.js
const authService = require('../services/auth.services');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.authenticateUser(email, password);
        res.status(200).json(user);
    } catch (error) {
        // Em caso de erro (ex: credenciais inválidas), retorna 401 Unauthorized
        res.status(401).json({ message: error.message });
    }
};

module.exports = {
    login
};
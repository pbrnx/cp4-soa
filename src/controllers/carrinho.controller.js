// src/controllers/carrinho.controller.js
const carrinhoService = require('../services/carrinho.services');

const getCarrinho = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const carrinho = await carrinhoService.getCarrinhoByClienteId(clienteId);
        res.status(200).json(carrinho);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const addItem = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const itemData = req.body; // Espera { produto_id, quantidade }
        const carrinhoAtualizado = await carrinhoService.addItem(carrinhoId, itemData);
        res.status(200).json(carrinhoAtualizado);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await carrinhoService.removeItem(itemId);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    getCarrinho,
    addItem,
    removeItem
};
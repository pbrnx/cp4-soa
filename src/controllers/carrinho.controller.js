// src/controllers/carrinho.controller.js
const carrinhoRepository = require('../repositories/carrinho.repositories');

const getCarrinho = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const carrinho = await carrinhoRepository.findCarrinhoByClienteId(clienteId);
        if (!carrinho) {
            return res.status(404).json({ message: "Carrinho não encontrado para este cliente." });
        }
        res.status(200).json(carrinho);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar carrinho", error: error.message });
    }
};

const addItem = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const novoItem = await carrinhoRepository.addItemAoCarrinho(carrinhoId, req.body);
        res.status(201).json(novoItem);
    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar item ao carrinho", error: error.message });
    }
};

const removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await carrinhoRepository.removeItemDoCarrinho(itemId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover item do carrinho", error: error.message });
    }
};

module.exports = {
    getCarrinho,
    addItem,
    removeItem
};
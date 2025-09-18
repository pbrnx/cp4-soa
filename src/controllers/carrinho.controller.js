//  src/controllers/carrinho.controller.js

const carrinhoService = require('../services/carrinho.services');

const { CarrinhoResponseDTO } = require('../dtos/carrinho.dtos');

const getCarrinho = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const carrinho = await carrinhoService.getCarrinhoByClienteId(clienteId);
        
        // 2. MAPEIE O RESULTADO PARA O DTO
        const carrinhoResponse = new CarrinhoResponseDTO(carrinho);
        res.status(200).json(carrinhoResponse);
    } catch (error) {
        console.error("Erro em getCarrinho:", error);
        res.status(404).json({ message: error.message });
    }
};

const addItem = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const itemData = req.body;
        const carrinhoAtualizado = await carrinhoService.addItem(carrinhoId, itemData);

   
        const carrinhoResponse = new CarrinhoResponseDTO(carrinhoAtualizado);
        res.status(200).json(carrinhoResponse);
    } catch (error) {
        console.error("Erro em addItem:", error);
        res.status(404).json({ message: error.message });
    }
};


const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantidade } = req.body;

        if (quantidade === undefined || typeof quantidade !== 'number') {
            return res.status(400).json({ message: "A quantidade (numérica) é obrigatória." });
        }

        await carrinhoService.updateItemQuantidade(itemId, quantidade);
        res.status(204).send();

    } catch (error) {
        console.error("Erro em updateItem:", error);
        res.status(404).json({ message: error.message });
    }
};

const removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await carrinhoService.removeItem(itemId);
        res.status(204).send();
    } catch (error) {
        console.error("Erro em removeItem:", error);
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    getCarrinho,
    addItem,
    updateItem,
    removeItem
};
// src/dtos/carrinho.dtos.js

class ItemCarrinhoResponseDTO {
    constructor(item) {
        this.id = item.id;
        this.produto_id = item.produto_id;
        this.nome_produto = item.nome_produto;
        this.quantidade = item.quantidade;
        this.preco_unitario = item.preco_unitario;
        this.subtotal = item.quantidade * item.preco_unitario;
    }
}

/**
 * DTO para a resposta completa do carrinho.
 * Ele formata o carrinho e seus itens, além de incluir o total.
 */
class CarrinhoResponseDTO {
    constructor(carrinho) {
        this.id = carrinho.id;
        this.cliente_id = carrinho.cliente_id;
        // Mapeia a lista de itens do modelo para a lista de ItemCarrinhoResponseDTO
        this.itens = carrinho.itens.map(item => new ItemCarrinhoResponseDTO(item));
        // Utiliza o método do modelo para obter o valor total
        this.total = carrinho.calcularTotal();
    }
}

module.exports = {
    CarrinhoResponseDTO
};
// src/dtos/pedido.dtos.js

class ItemPedidoResponseDTO {
    constructor(item) {
        this.id = item.id;
        this.produto_id = item.produto_id;
        this.quantidade = item.quantidade;
        this.preco_unitario = item.preco_unitario;
        this.subtotal = item.quantidade * item.preco_unitario;
    }
}


class PedidoResponseDTO {
    constructor(pedido) {
        this.id = pedido.id;
        this.cliente_id = pedido.cliente_id;
        this.total = pedido.total;
        this.status = pedido.status;
        // Mapeia a lista de itens do modelo para a lista de ItemPedidoResponseDTO
        this.itens = pedido.itens.map(item => new ItemPedidoResponseDTO(item));
    }
}

module.exports = {
    PedidoResponseDTO
};
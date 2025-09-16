// src/models/pedido.model.js

class ItemPedido {
    constructor(id, produto_id, quantidade, preco_unitario) {
        this.id = id;
        this.produto_id = produto_id;
        this.quantidade = quantidade;
        this.preco_unitario = preco_unitario;
    }
}

class Pedido {
    constructor(id, cliente_id, total, status) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.total = total;
        this.status = status;
        this.itens = []; // Array de ItemPedido
    }
    
    adicionarItem(item) {
        this.itens.push(item);
    }
}

module.exports = { Pedido, ItemPedido };
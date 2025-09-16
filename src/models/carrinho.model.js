// src/models/carrinho.model.js

class ItemCarrinho {
    constructor(id, produto_id, nome_produto, quantidade, preco_unitario) {
        this.id = id;
        this.produto_id = produto_id;
        this.nome_produto = nome_produto;
        this.quantidade = quantidade;
        this.preco_unitario = preco_unitario;
    }
}

class Carrinho {
    constructor(id, cliente_id) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.itens = []; // Array de ItemCarrinho
    }

    adicionarItem(item) {
        this.itens.push(item);
    }

    calcularTotal() {
        return this.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0);
    }
}

module.exports = { Carrinho, ItemCarrinho };
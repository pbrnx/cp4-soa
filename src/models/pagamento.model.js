// src/models/pagamento.model.js

class Pagamento {
    constructor(id, pedido_id, valor, status, metodo) {
        this.id = id;
        this.pedido_id = pedido_id;
        this.valor = valor;
        this.status = status;
        this.metodo = metodo;
    }
}

module.exports = Pagamento;
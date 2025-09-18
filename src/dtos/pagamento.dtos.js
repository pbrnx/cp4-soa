//src/dtos/pagamento.dtos.js
class PagamentoResponseDTO {
    constructor(pagamento) {
        this.id = pagamento.id;
        this.pedido_id = pagamento.pedido_id;
        this.valor = pagamento.valor;
        this.status = pagamento.status;
        this.metodo = pagamento.metodo;
    }
}

module.exports = {
    PagamentoResponseDTO
};
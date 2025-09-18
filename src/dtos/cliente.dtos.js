// src/dtos/cliente.dtos.js

/**
 * Define a estrutura de dados que a API retornará para um cliente.
 * Ele atua como um filtro, garantindo que apenas dados seguros sejam expostos.
 */
class ClienteResponseDTO {
    constructor(cliente) {
        this.id = cliente.id;
        this.nome = cliente.nome;
        this.email = cliente.email;
        this.documento = cliente.documento;
    }
}


module.exports = {
    ClienteResponseDTO
};
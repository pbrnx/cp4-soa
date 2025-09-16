// src/models/cliente.model.js

class Cliente {
    constructor(id, nome, email, documento) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.documento = documento;
    }
}

module.exports = Cliente;
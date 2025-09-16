// src/models/produto.model.js

class Produto {
    constructor(id, nome, preco, categoria, descricao, ativo) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.categoria = categoria;
        this.descricao = descricao;
        this.ativo = ativo;
    }
}

module.exports = Produto;
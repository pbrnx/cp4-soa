// src/models/produto.model.js

class Produto {
    // CORREÇÃO: Adicionamos 'imagem_url' como o sétimo parâmetro do construtor
    constructor(id, nome, preco, categoria, descricao, ativo, imagem_url) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.categoria = categoria;
        this.descricao = descricao;
        this.ativo = ativo;
        // CORREÇÃO: Atribuímos o valor recebido à propriedade do objeto
        this.imagem_url = imagem_url;
    }
}

module.exports = Produto;
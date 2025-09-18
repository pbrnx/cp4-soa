//src/dtos/produto.dtos.js


class ProdutoResponseDTO {
    constructor(produto) {
        this.id = produto.id;
        this.nome = produto.nome;
        this.preco = produto.preco;
        this.categoria = produto.categoria;
        this.descricao = produto.descricao;
        this.ativo = produto.ativo;
        this.imagem_url = produto.imagem_url;
    }
}

module.exports = {
    ProdutoResponseDTO
};
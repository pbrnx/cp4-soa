// app.js
const express = require('express');

// Importação das rotas
const clienteRoutes = require('./src/routes/cliente.routes');
const produtoRoutes = require('./src/routes/produto.routes');
const carrinhoRoutes = require('./src/routes/carrinho.routes');
const pedidoRoutes = require('./src/routes/pedido.routes');
const pagamentoRoutes = require('./src/routes/pagamento.routes');

// Cria a instância do Express
const app = express();

// Middleware para permitir que o Express entenda JSON no corpo das requisições
app.use(express.json());

//servir rota html
app.use(express.static('static'));

// Rota raiz para teste
app.get('/', (req, res) => {
    res.send('API de E-commerce está no ar!');
});

// Configuração das rotas da API
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinhos', carrinhoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);


// Define a porta em que o servidor vai escutar
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em http://localhost:${PORT}`);
});
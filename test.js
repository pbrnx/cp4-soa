// test-endpoints.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Helper para imprimir os resultados de forma organizada
const logTest = (title, data) => {
    console.log(`\n--- ${title} ---`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log('--------------------\n');
};

const runFullApiTest = async () => {
    console.log('🚀 Iniciando suíte de testes completa da API...');
    let clienteId, produtoId, carrinhoId, itemId, pedidoId;

    try {
        // --- 1. Testando Endpoints de CLIENTES ---
        console.log('--- Iniciando testes de Clientes ---');
        // POST /clientes
        const novoCliente = {
            nome: "Cliente de Teste",
            email: `teste-${Date.now()}@example.com`,
            documento: "99988877766"
        };
        let res = await axios.post(`${BASE_URL}/clientes`, novoCliente);
        clienteId = res.data.id;
        logTest('✅ [201] POST /clientes (Criar Cliente)', res.data);

        // GET /clientes
        res = await axios.get(`${BASE_URL}/clientes`);
        logTest('✅ [200] GET /clientes (Listar Clientes)', res.data);

        // GET /clientes/:id
        res = await axios.get(`${BASE_URL}/clientes/${clienteId}`);
        logTest(`✅ [200] GET /clientes/${clienteId} (Buscar Cliente)`, res.data);

        // PUT /clientes/:id
        const clienteAtualizado = {
            nome: "Cliente de Teste Atualizado",
            email: `teste-atualizado-${Date.now()}@example.com`,
            documento: "11122233344"
        };
        res = await axios.put(`${BASE_URL}/clientes/${clienteId}`, clienteAtualizado);
        logTest(`✅ [200] PUT /clientes/${clienteId} (Atualizar Cliente)`, res.data);

        // --- 2. Testando Endpoints de PRODUTOS ---
        console.log('--- Iniciando testes de Produtos ---');
        // POST /produtos
        const novoProduto = {
            nome: "Produto de Teste",
            preco: 99.99,
            categoria: "Teste",
            descricao: "Descrição do produto de teste",
            ativo: true
        };
        res = await axios.post(`${BASE_URL}/produtos`, novoProduto);
        produtoId = res.data.id;
        logTest('✅ [201] POST /produtos (Criar Produto)', res.data);

        // --- 3. Fluxo de Compra ---
        console.log('--- Iniciando testes do Fluxo de Compra ---');
        // GET /carrinhos/cliente/:clienteId
        res = await axios.get(`${BASE_URL}/carrinhos/cliente/${clienteId}`);
        carrinhoId = res.data.id;
        logTest(`✅ [200] GET /carrinhos/cliente/${clienteId} (Obter Carrinho)`, res.data);

        // POST /carrinhos/:carrinhoId/items
        const item = { produto_id: produtoId, quantidade: 2 };
        res = await axios.post(`${BASE_URL}/carrinhos/${carrinhoId}/items`, item);
        itemId = res.data.itens[0].id;
        logTest(`✅ [200] POST /carrinhos/${carrinhoId}/items (Adicionar Item)`, res.data);

        // DELETE /carrinhos/items/:itemId
        // Adicionando um segundo item para remover em seguida
        const tempItemRes = await axios.post(`${BASE_URL}/carrinhos/${carrinhoId}/items`, { produto_id: produtoId, quantidade: 1 });
        const tempItemId = tempItemRes.data.itens.find(i => i.id !== itemId).id;
        res = await axios.delete(`${BASE_URL}/carrinhos/items/${tempItemId}`);
        logTest(`✅ [204] DELETE /carrinhos/items/${tempItemId} (Remover Item)`, { status: res.status, statusText: res.statusText });

        // POST /pedidos
        res = await axios.post(`${BASE_URL}/pedidos`, { carrinhoId });
        pedidoId = res.data.id;
        logTest('✅ [201] POST /pedidos (Criar Pedido)', res.data);

        // GET /pedidos/:id
        res = await axios.get(`${BASE_URL}/pedidos/${pedidoId}`);
        logTest(`✅ [200] GET /pedidos/${pedidoId} (Buscar Pedido)`, res.data);

        // POST /pagamentos
        const pagamento = { pedido_id: pedidoId, metodo: "Cartão de Teste" };
        res = await axios.post(`${BASE_URL}/pagamentos`, pagamento);
        logTest('✅ [201] POST /pagamentos (Criar Pagamento)', res.data);

        // GET /pagamentos/pedido/:pedidoId
        res = await axios.get(`${BASE_URL}/pagamentos/pedido/${pedidoId}`);
        logTest(`✅ [200] GET /pagamentos/pedido/${pedidoId} (Buscar Pagamento)`, res.data);

    } catch (error) {
        console.error('\n❌ Um teste falhou!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Erro:', error.message);
        }
    } finally {
        // --- 4. Limpeza (Cleanup) ---
        console.log('--- Iniciando Limpeza dos Dados de Teste ---');
        try {
            if (clienteId) {
                await axios.delete(`${BASE_URL}/clientes/${clienteId}`);
                logTest(`🗑️  DELETE /clientes/${clienteId} (Cliente de teste removido)`);
            }
            if (produtoId) {
                await axios.delete(`${BASE_URL}/produtos/${produtoId}`);
                logTest(`🗑️  DELETE /produtos/${produtoId} (Produto de teste removido)`);
            }
            // Pedidos e pagamentos não possuem rota de delete, o que é comum.
            // O carrinho é esvaziado ao criar o pedido.
        } catch (error) {
            console.error('Erro durante a limpeza:', error.message);
        }

        console.log('🏁 Suite de testes finalizada.');
    }
};

runFullApiTest();
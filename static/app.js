// static/app.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    //  1. STATE E CONSTANTES GLOBAIS
    // =================================================================
    const API_URL = '/api';

    // Objeto para guardar o estado da aplicação
    const state = {
        clienteId: null,
        carrinho: null,
    };

    // Mapeamento dos elementos do DOM para fácil acesso
    const UI = {
        productList: document.getElementById('product-list'),
        cartButton: document.getElementById('cart-button'),
        cartCount: document.getElementById('cart-count'),
        productsView: document.getElementById('products-view'),
        cartView: document.getElementById('cart-view'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartTotal: document.getElementById('cart-total'),
        pageTitle: document.getElementById('page-title'),
        backToProducts: document.getElementById('back-to-products'),
        checkoutButton: document.getElementById('checkout-button'),
        checkoutMessage: document.getElementById('checkout-message'),
    };


    // =================================================================
    //  2. FUNÇÕES DE RENDERIZAÇÃO (cuidam de exibir as coisas na tela)
    // =================================================================

    /** Mostra um loader enquanto os dados são carregados */
    const renderLoader = (container) => {
        container.innerHTML = `
            <div class="loader">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>
        `;
    };

    /** Renderiza a lista de produtos na tela */
    const renderProducts = (products) => {
        UI.productList.innerHTML = ''; // Limpa a lista atual
        if (!products || products.length === 0) {
            UI.productList.innerHTML = '<p class="text-center">Nenhum produto encontrado.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = `
                <div class="col">
                    <div class="card h-100">
                        <img src="https://via.placeholder.com/300x200.png?text=${product.nome}" class="card-img-top" alt="${product.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${product.nome}</h5>
                            <p class="card-text">${product.descricao}</p>
                            <p class="card-price">R$ ${product.preco.toFixed(2)}</p>
                        </div>
                        <div class="card-footer bg-transparent border-0">
                            <button class="btn btn-primary w-100 btn-add-to-cart" data-product-id="${product.id}">
                                <i class="bi bi-cart-plus-fill"></i> Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            UI.productList.innerHTML += productCard;
        });
    };

    /** Renderiza o conteúdo do carrinho */
    const renderCart = () => {
        // Atualiza o contador no header
        const itemCount = state.carrinho.itens.reduce((sum, item) => sum + item.quantidade, 0);
        UI.cartCount.textContent = itemCount;

        // Limpa a view do carrinho
        UI.cartItemsContainer.innerHTML = '';

        if (state.carrinho.itens.length === 0) {
            UI.cartItemsContainer.innerHTML = '<p class="text-center">Seu carrinho está vazio.</p>';
            UI.checkoutButton.disabled = true;
        } else {
            state.carrinho.itens.forEach(item => {
                const cartItemHTML = `
                    <div class="cart-item">
                        <img src="https://via.placeholder.com/80x80.png?text=${item.nome_produto}" class="cart-item-img" alt="${item.nome_produto}">
                        <div class="cart-item-details">
                            <h6 class="mb-0">${item.nome_produto}</h6>
                            <small>Quantidade: ${item.quantidade}</small>
                            <p class="mb-0 fw-bold">R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="btn btn-sm btn-outline-danger btn-remove-from-cart" data-item-id="${item.id}">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </div>
                `;
                UI.cartItemsContainer.innerHTML += cartItemHTML;
            });
            UI.checkoutButton.disabled = false;
        }

        // Atualiza o total
        const total = state.carrinho.calcularTotal();
        UI.cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    };

    // =================================================================
    //  3. LÓGICA DA APLICAÇÃO E CHAMADAS DE API
    // =================================================================

    /** Busca produtos da API e os renderiza */
    const fetchAndRenderProducts = async () => {
        renderLoader(UI.productList);
        try {
            const response = await fetch(`${API_URL}/produtos`);
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Falha ao buscar produtos:', error);
            UI.productList.innerHTML = '<p class="text-center text-danger">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        }
    };

    /** Busca o carrinho do cliente na API */
    const fetchCart = async () => {
        if (!state.clienteId) return;
        try {
            const response = await fetch(`${API_URL}/carrinhos/cliente/${state.clienteId}`);
            const cartData = await response.json();
            // Adicionamos o método de calcular total ao objeto do carrinho
            state.carrinho = { ...cartData, calcularTotal: () => cartData.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0) };
            renderCart();
        } catch (error) {
            console.error('Falha ao buscar carrinho:', error);
        }
    };

    /** Adiciona um produto ao carrinho */
    const handleAddToCart = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/carrinhos/${state.carrinho.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ produto_id: productId, quantidade: 1 })
            });
            const updatedCart = await response.json();
            state.carrinho = { ...updatedCart, calcularTotal: () => updatedCart.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0) };
            renderCart();
        } catch (error) {
            console.error('Falha ao adicionar item:', error);
        }
    };

    /** Remove um item do carrinho */
    const handleRemoveFromCart = async (itemId) => {
        try {
            await fetch(`${API_URL}/carrinhos/items/${itemId}`, { method: 'DELETE' });
            // Após remover, busca o carrinho atualizado
            await fetchCart();
        } catch (error) {
            console.error('Falha ao remover item:', error);
        }
    };
    
    /** Processo de finalizar a compra */
    const handleCheckout = async () => {
        UI.checkoutButton.disabled = true;
        UI.checkoutMessage.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Processando...</span></div> Processando seu pedido...';

        try {
            // 1. Criar o pedido
            const pedidoResponse = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrinhoId: state.carrinho.id })
            });
            if (!pedidoResponse.ok) throw new Error('Falha ao criar o pedido.');
            const pedido = await pedidoResponse.json();

            // 2. Criar o pagamento
            const pagamentoResponse = await fetch(`${API_URL}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedido_id: pedido.id, metodo: "Cartão de Crédito" })
            });
            if (!pagamentoResponse.ok) throw new Error('Falha ao processar o pagamento.');

            // Sucesso!
            UI.checkoutMessage.innerHTML = `
                <div class="alert alert-success">
                    <strong>Pedido #${pedido.id} realizado com sucesso!</strong> Agradecemos a sua compra.
                </div>
            `;
            await fetchCart(); // Atualiza o carrinho (que agora estará vazio)
        
        } catch(error) {
            console.error('Erro no checkout:', error);
            UI.checkoutMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            UI.checkoutButton.disabled = false;
        }
    };

    /** Gerencia a troca de "páginas" (views) */
    const switchView = (viewName) => {
        // Esconde todas as views
        UI.productsView.classList.add('d-none');
        UI.cartView.classList.add('d-none');
        UI.backToProducts.classList.add('d-none');

        // Mostra a view desejada
        if (viewName === 'products') {
            UI.productsView.classList.remove('d-none');
            UI.pageTitle.textContent = 'Nossos Produtos';
        } else if (viewName === 'cart') {
            UI.cartView.classList.remove('d-none');
            UI.pageTitle.textContent = 'Seu Carrinho';
            UI.backToProducts.classList.remove('d-none');
            UI.checkoutMessage.innerHTML = ''; // Limpa mensagens antigas
        }
    };

    /** Inicializa a aplicação */
    const init = async () => {
        // Simulação de "login": verifica se já existe um cliente no localStorage
        let clienteId = localStorage.getItem('clienteId');
        if (!clienteId) {
            try {
                const response = await fetch(`${API_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: "Cliente Visitante",
                        email: `visitante-${Date.now()}@loja.com`,
                        documento: "00000000000"
                    })
                });
                const novoCliente = await response.json();
                clienteId = novoCliente.id;
                localStorage.setItem('clienteId', clienteId);
            } catch (error) {
                console.error("Não foi possível criar um cliente inicial.", error);
                return;
            }
        }
        state.clienteId = clienteId;

        // Configura os event listeners
        setupEventListeners();

        // Busca os dados iniciais
        await fetchAndRenderProducts();
        await fetchCart();
    };

    // =================================================================
    //  4. EVENT LISTENERS (interações do usuário)
    // =================================================================
    const setupEventListeners = () => {
        // Usando event delegation para os botões que são criados dinamicamente
        document.body.addEventListener('click', (event) => {
            if (event.target.matches('.btn-add-to-cart')) {
                const productId = event.target.dataset.productId;
                handleAddToCart(productId);
            }
            if (event.target.matches('.btn-remove-from-cart, .btn-remove-from-cart *')) {
                const button = event.target.closest('.btn-remove-from-cart');
                const itemId = button.dataset.itemId;
                handleRemoveFromCart(itemId);
            }
        });

        UI.cartButton.addEventListener('click', () => switchView('cart'));
        UI.backToProducts.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('products');
        });
        UI.checkoutButton.addEventListener('click', handleCheckout);
    };

    // =================================================================
    //  5. INICIALIZAÇÃO
    // =================================================================
    init();

});
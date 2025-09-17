// static/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    //  1. STATE, CONSTANTES GLOBAIS E ELEMENTOS DA UI
    // =================================================================
    const API_URL = '/api';

    const state = {
        currentUser: null,
        carrinho: null,
    };

    const UI = {
        productList: document.getElementById('product-list'),
        cartButton: document.getElementById('cart-button'),
        cartCount: document.getElementById('cart-count'),
        loginButton: document.getElementById('login-button'),
        userSessionContainer: document.getElementById('user-session'),
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
    //  2. FUNÇÕES DE RENDERIZAÇÃO E UI
    // =================================================================

    const renderHeader = () => {
        UI.userSessionContainer.innerHTML = '';
        if (state.currentUser) {
            UI.loginButton.classList.add('d-none');
            const welcomeHTML = `
                <span class="navbar-text me-2">Olá, ${state.currentUser.nome}</span>
                <button class="btn btn-outline-light" id="logout-button">Sair</button>
            `;
            UI.userSessionContainer.innerHTML += welcomeHTML;
            if (state.currentUser.isAdmin) {
                const adminConsoleButton = `
                    <button class="btn btn-warning ms-2" id="admin-console-button">
                        <i class="bi bi-gear-fill"></i> Admin
                    </button>
                `;
                UI.userSessionContainer.innerHTML += adminConsoleButton;
            }
        } else {
            UI.loginButton.classList.remove('d-none');
        }
    };

    const renderProducts = (products) => {
        UI.productList.innerHTML = '';
        if (!products || products.length === 0) {
            UI.productList.innerHTML = '<p class="text-center">Nenhum produto encontrado.</p>';
            return;
        }
        products.forEach(product => {
            const imageUrl = product.imagem_url ? product.imagem_url : `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(product.nome)}`;
            const productCard = `
                <div class="col">
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${product.nome}</h5>
                            <p class="card-text">${product.descricao || ''}</p>
                            <p class="card-price">R$ ${product.preco.toFixed(2)}</p>
                        </div>
                        <div class="card-footer bg-transparent border-0 d-flex gap-2">
                            <button class="btn btn-primary w-100 btn-add-to-cart" data-product-id="${product.id}">
                                <i class="bi bi-cart-plus-fill"></i> Adicionar
                            </button>
                            ${state.currentUser && state.currentUser.isAdmin ? `
                            <button class="btn btn-outline-danger btn-delete-product" data-product-id="${product.id}">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            UI.productList.innerHTML += productCard;
        });
    };

    const renderCart = () => {
        if (!state.carrinho) return;
        const itemCount = state.carrinho.itens.reduce((sum, item) => sum + item.quantidade, 0);
        UI.cartCount.textContent = itemCount;
        UI.cartItemsContainer.innerHTML = '';
        if (state.carrinho.itens.length === 0) {
            UI.cartItemsContainer.innerHTML = '<p class="text-center">Seu carrinho está vazio.</p>';
            UI.checkoutButton.disabled = true;
        } else {
            state.carrinho.itens.forEach(item => {
                const cartItemHTML = `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h6 class="mb-0">${item.nome_produto}</h6>
                            <small>Quantidade: ${item.quantidade}</small>
                            <p class="mb-0 fw-bold">R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-danger btn-remove-from-cart" data-item-id="${item.id}">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                `;
                UI.cartItemsContainer.innerHTML += cartItemHTML;
            });
            UI.checkoutButton.disabled = false;
        }
        const total = state.carrinho.calcularTotal();
        UI.cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    };

    // =================================================================
    //  3. LÓGICA DA APLICAÇÃO E CHAMADAS DE API
    // =================================================================
    
    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/produtos`);
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Falha ao buscar produtos:', error);
        }
    };

    const fetchCart = async () => {
        if (!state.currentUser) return;
        try {
            const response = await fetch(`${API_URL}/carrinhos/cliente/${state.currentUser.id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Não foi possível obter o carrinho.');
            }
            const cartData = await response.json();
            state.carrinho = { ...cartData, calcularTotal: () => cartData.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0) };
            renderCart();
        } catch (error) {
            console.error('Falha ao buscar carrinho:', error);
            state.carrinho = null;
        }
    };
    
    const handleAddToCart = async (productId) => {
        if (!state.currentUser) {
            alert('Você precisa fazer login para adicionar itens ao carrinho.');
            window.location.href = 'login.html';
            return;
        }
        if (!state.carrinho || !state.carrinho.id) {
            alert('Erro ao encontrar seu carrinho. Por favor, recarregue a página e tente novamente.');
            console.error('Tentativa de adicionar ao carrinho sem um ID de carrinho válido.');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/carrinhos/${state.carrinho.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ produto_id: productId, quantidade: 1 })
            });
            if (!response.ok) throw new Error('Não foi possível adicionar o item.');
            await fetchCart();
        } catch (error) {
            console.error('Falha ao adicionar item:', error);
        }
    };

    const handleRemoveFromCart = async (itemId) => {
        try {
            await fetch(`${API_URL}/carrinhos/items/${itemId}`, { method: 'DELETE' });
            await fetchCart();
        } catch (error) {
            console.error('Falha ao remover item:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            const response = await fetch(`${API_URL}/produtos/${productId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir produto.');
            await fetchAndRenderProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert(error.message);
        }
    };
    
    // =================================================================
    //  NOVA FUNÇÃO DE CHECKOUT IMPLEMENTADA
    // =================================================================
    const handleCheckout = async () => {
        if (!state.carrinho || state.carrinho.itens.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        UI.checkoutButton.disabled = true;
        UI.checkoutMessage.innerHTML = `<div class="alert alert-info">Processando seu pedido...</div>`;

        try {
            // 1. Criar o Pedido
            const pedidoResponse = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrinhoId: state.carrinho.id })
            });

            if (!pedidoResponse.ok) {
                throw new Error('Não foi possível criar o pedido.');
            }
            const novoPedido = await pedidoResponse.json();

            // 2. Simular o Pagamento
            const pagamentoResponse = await fetch(`${API_URL}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pedido_id: novoPedido.id,
                    metodo: "Cartão de Crédito" // Método de pagamento fixo para o exemplo
                })
            });

            if (!pagamentoResponse.ok) {
                throw new Error('O pagamento falhou.');
            }

            // 3. Sucesso!
            UI.checkoutMessage.innerHTML = `
                <div class="alert alert-success">
                    <strong>Pedido #${novoPedido.id} realizado com sucesso!</strong><br>
                    O pagamento foi aprovado. Obrigado por comprar na QualityStore!
                </div>
            `;
            
            // Atualiza o carrinho (que agora estará vazio)
            await fetchCart();

        } catch (error) {
            console.error("Erro no checkout:", error);
            UI.checkoutMessage.innerHTML = `<div class="alert alert-danger">Houve um erro ao finalizar seu pedido: ${error.message}</div>`;
            UI.checkoutButton.disabled = false; // Habilita o botão para tentar novamente
        }
    };

    const switchView = (viewName) => {
        UI.productsView.classList.add('d-none');
        UI.cartView.classList.add('d-none');
        UI.backToProducts.classList.add('d-none');
        if (viewName === 'products') {
            UI.productsView.classList.remove('d-none');
            UI.pageTitle.textContent = 'Nossos Produtos';
        } else if (viewName === 'cart') {
            UI.cartView.classList.remove('d-none');
            UI.pageTitle.textContent = 'Seu Carrinho';
            UI.backToProducts.classList.remove('d-none');
            UI.checkoutMessage.innerHTML = '';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        state.currentUser = null;
        state.carrinho = null;
        window.location.reload();
    };

    // =================================================================
    //  4. EVENT LISTENERS
    // =================================================================
    const setupEventListeners = () => {
        document.body.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            if (button.matches('.btn-add-to-cart')) handleAddToCart(button.dataset.productId);
            if (button.matches('.btn-remove-from-cart')) handleRemoveFromCart(button.dataset.itemId);
            if (button.matches('.btn-delete-product')) handleDeleteProduct(button.dataset.productId);
            if (button.matches('#logout-button')) handleLogout();
            if (button.matches('#admin-console-button')) location.href = 'admin.html';
        });

        UI.cartButton.addEventListener('click', () => {
            if (!state.currentUser) {
                alert('Faça login para ver seu carrinho.');
                window.location.href = 'login.html';
                return;
            }
            switchView('cart');
        });

        UI.backToProducts.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('products');
        });
        
        UI.checkoutButton.addEventListener('click', handleCheckout);
    };

    // =================================================================
    //  5. INICIALIZAÇÃO DA APLICAÇÃO
    // =================================================================
    const init = async () => {
        const userFromStorage = localStorage.getItem('currentUser');
        if (userFromStorage) {
            state.currentUser = JSON.parse(userFromStorage);
        }
        renderHeader();
        setupEventListeners();
        await fetchAndRenderProducts();
        if (state.currentUser) {
            await fetchCart();
        } else {
            UI.cartCount.textContent = '0';
        }
    };

    init();
});
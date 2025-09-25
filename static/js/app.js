// static/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    //  1. STATE, CONSTANTES GLOBAIS E ELEMENTOS DA UI
    // =================================================================
    const API_URL = '/api';

    const state = {
        currentUser: null,
        carrinho: null,
        products: [],
    };

    const UI = {
        productList: document.getElementById('product-list'),
        cartButton: document.getElementById('cart-button'),
        cartCount: document.getElementById('cart-count'),
        loginButton: document.getElementById('login-button'),
        userSessionContainer: document.getElementById('user-session'),
        productsView: document.getElementById('products-view'),
        cartView: document.getElementById('cart-view'),
        paymentView: document.getElementById('payment-view'),
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
            UI.loginButton.classList.add('hidden');
            
            const welcomeHTML = `
                <span style="color: var(--color-text-body);">Olá, ${state.currentUser.nome}</span>
                <button class="nav-button" id="logout-button">Sair</button>
            `;
            UI.userSessionContainer.innerHTML += welcomeHTML;

            if (state.currentUser.isAdmin) {
                const adminConsoleButton = `
                    <a href="admin.html" class="nav-button" id="admin-console-button">
                        <i class="bi bi-gear-fill"></i> Admin
                    </a>
                `;
                UI.userSessionContainer.innerHTML += adminConsoleButton;
            }
        } else {
            UI.loginButton.classList.remove('hidden');
        }
    };

    const renderProducts = (products) => {
        UI.productList.innerHTML = '';
        if (!products || products.length === 0) {
            UI.productList.innerHTML = '<p style="text-align: center; color: var(--color-text-body);">Nenhum produto encontrado.</p>';
            return;
        }
        products.forEach(product => {
            const imageUrl = product.imagem_url ? product.imagem_url : `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(product.nome)}`;
            const productCard = `
                <div class="product-card">
                    <img src="${imageUrl}" class="card-img-top" alt="${product.nome}">
                    <div class="card-body">
                        <div>
                            <h5 class="card-title">${product.nome}</h5>
                            <p class="card-text">${product.descricao || ''}</p>
                            <p class="card-price">R$ ${product.preco.toFixed(2)}</p>
                        </div>
                        <div class="card-footer">
                            <button class="btn-add-to-cart" data-product-id="${product.id}">
                                <i class="bi bi-cart-plus-fill"></i> Adicionar
                            </button>
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
            UI.cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-body);">Seu carrinho está vazio.</p>';
            UI.checkoutButton.disabled = true;
        } else {
            state.carrinho.itens.forEach(item => {
                const productInfo = state.products.find(p => p.id === item.produto_id);
                const imageUrl = productInfo?.imagem_url || `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(item.nome_produto)}`;

                const cartItemHTML = `
                    <div class="cart-item">
                        <img src="${imageUrl}" alt="${item.nome_produto}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h6 class="cart-item-title">${item.nome_produto}</h6>
                            <p class="cart-item-info">R$ ${item.preco_unitario.toFixed(2)} cada</p>
                            <div class="cart-item-quantity-controls">
                                <button class="btn-quantity" data-item-id="${item.id}" data-action="decrease" title="Diminuir">-</button>
                                <span>${item.quantidade}</span>
                                <button class="btn-quantity" data-item-id="${item.id}" data-action="increase" title="Aumentar">+</button>
                            </div>
                        </div>
                        <div class="cart-item-price">
                            <p>R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}</p>
                        </div>
                        <button class="btn-remove-from-cart" data-item-id="${item.id}" title="Remover item">
                            <i class="bi bi-x-lg"></i>
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
            state.products = products;
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

    const handleUpdateQuantity = async (itemId, action) => {
        const item = state.carrinho.itens.find(i => i.id === parseInt(itemId));
        if (!item) return;

        let novaQuantidade = item.quantidade;
        if (action === 'increase') {
            novaQuantidade++;
        } else if (action === 'decrease') {
            novaQuantidade--;
        }

        try {
            if (novaQuantidade <= 0) {
                await fetch(`${API_URL}/carrinhos/items/${itemId}`, { method: 'DELETE' });
            } else {
                await fetch(`${API_URL}/carrinhos/items/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantidade: novaQuantidade })
                });
            }
            await fetchCart();
        } catch (error) {
            console.error('Falha ao atualizar a quantidade do item:', error);
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
    
    const handleCheckout = async () => {
        if (!state.carrinho || state.carrinho.itens.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        UI.checkoutButton.disabled = true;
        UI.checkoutMessage.innerHTML = `<div class="status-info">Processando seu pedido...</div>`;

        try {
            const pedidoResponse = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrinhoId: state.carrinho.id })
            });
            if (!pedidoResponse.ok) throw new Error('Não foi possível criar o pedido.');
            const novoPedido = await pedidoResponse.json();

            switchView('payment', 'left');
            showPaymentOptions(novoPedido);

        } catch (error) {
            console.error("Erro no checkout:", error);
            UI.checkoutMessage.innerHTML = `<div class="status-error">Houve um erro: ${error.message}</div>`;
            UI.checkoutButton.disabled = false;
        }
    };

    function showPaymentOptions(pedido) {
        document.getElementById('payment-order-id').textContent = `#${pedido.id}`;
        document.getElementById('payment-order-total').textContent = `R$ ${pedido.total.toFixed(2)}`;
        
        const processPaymentButton = document.getElementById('process-payment-button');
        const newButton = processPaymentButton.cloneNode(true);
        processPaymentButton.parentNode.replaceChild(newButton, processPaymentButton);
        
        newButton.addEventListener('click', () => handleProcessPayment(pedido.id));
    }

    async function handleProcessPayment(pedidoId) {
        const paymentMessage = document.getElementById('payment-message');
        const paymentButton = document.getElementById('process-payment-button');
        const selectedMethod = document.getElementById('payment-method-select').value;

        paymentButton.disabled = true;
        paymentMessage.innerHTML = `<div class="status-info">Processando pagamento...</div>`;

        try {
            const pagamentoResponse = await fetch(`${API_URL}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pedido_id: pedidoId,
                    metodo: selectedMethod
                })
            });

            if (!pagamentoResponse.ok) {
                const errorData = await pagamentoResponse.json();
                throw new Error(errorData.message || 'O pagamento falhou.');
            }

            paymentMessage.innerHTML = `
                <div class="status-success">
                    <strong>Pagamento aprovado!</strong><br>
                    Obrigado por comprar na QualityStore! Em breve você voltará para a loja.
                </div>`;
            
            await fetchCart();

            setTimeout(() => {
                switchView('products', 'right');
            }, 3000);

        } catch (error) {
            paymentMessage.innerHTML = `<div class="status-error">Houve um erro: ${error.message}</div>`;
            paymentButton.disabled = false;
        }
    }

    const switchView = (viewName, direction = 'left') => {
        const views = {
            products: UI.productsView,
            cart: UI.cartView,
            payment: UI.paymentView
        };

        const targetView = views[viewName];
        if (!targetView) return;

        const currentActiveView = document.querySelector('.view.active');
        if (currentActiveView === targetView) return;

        if (currentActiveView) {
            const exitClass = direction === 'left' ? 'exiting-left' : 'exiting-right';
            currentActiveView.classList.add(exitClass);
            currentActiveView.classList.remove('active');
            
            // Limpa a classe de saída após a animação para poder reverter
            setTimeout(() => {
                currentActiveView.classList.remove(exitClass);
            }, 400); // Duração da animação
        }

        targetView.classList.add('active');
        targetView.classList.remove('exiting-left', 'exiting-right');

        if (viewName === 'products') {
            UI.pageTitle.textContent = 'Nossos Produtos';
            UI.backToProducts.classList.add('hidden');
        } else {
            UI.pageTitle.textContent = viewName === 'cart' ? 'Seu Carrinho' : 'Finalizar Pagamento';
            UI.backToProducts.classList.remove('hidden');
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
            if (button.matches('#logout-button')) handleLogout();
            if (button.matches('.btn-quantity')) {
                const itemId = button.dataset.itemId;
                const action = button.dataset.action;
                handleUpdateQuantity(itemId, action);
            }
        });

        UI.cartButton.addEventListener('click', () => {
            if (!state.currentUser) {
                alert('Faça login para ver seu carrinho.');
                window.location.href = 'login.html';
                return;
            }
            switchView('cart', 'left');
        });

        UI.backToProducts.addEventListener('click', (e) => {
            e.preventDefault();
            const currentActive = document.querySelector('.view.active').id;
            // Se estiver no pagamento, volta pro carrinho. Se estiver no carrinho, volta pros produtos.
            const targetView = currentActive === 'payment-view' ? 'cart' : 'products';
            switchView(targetView, 'right');
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
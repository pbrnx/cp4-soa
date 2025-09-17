// static/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = 'index.html';
        return;
    }

    const API_URL = '/api';

    const UI = {
        productList: document.getElementById('admin-product-list'),
        customerList: document.getElementById('admin-customer-list'),
        orderList: document.getElementById('admin-order-list'),
        productForm: document.getElementById('form-product'),
        productFormTitle: document.getElementById('form-product-title'),
        productIdInput: document.getElementById('produto-id'),
        productNameInput: document.getElementById('produto-nome'),
        productPriceInput: document.getElementById('produto-preco'),
        productCategoryInput: document.getElementById('produto-categoria'),
        productDescriptionInput: document.getElementById('produto-descricao'),
        btnCancelEdit: document.getElementById('btn-cancel-edit'),
        tabs: document.querySelectorAll('.tab-link'),
        tabContents: document.querySelectorAll('.tab-content')
    };

    const resetProductForm = () => {
        UI.productForm.reset();
        UI.productIdInput.value = '';
        UI.productFormTitle.textContent = 'Adicionar Novo Produto';
        UI.btnCancelEdit.classList.add('hidden');
    };

    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/produtos/admin`);
            const products = await response.json();
            
            UI.productList.innerHTML = '';
            if (products.length === 0) {
                UI.productList.innerHTML = '<p>Nenhum produto cadastrado.</p>';
                return;
            }

            products.forEach(product => {
                const item = document.createElement('div');
                item.className = 'list-item';
                const imageUrl = product.imagem_url || 'https://via.placeholder.com/50x50.png?text=Sem+Foto';

                const actionButton = product.ativo
                    ? `<button class="action-btn delete btn-delete-product" data-id="${product.id}" title="Desativar"><i class="bi bi-trash-fill"></i></button>`
                    : `<button class="action-btn reactivate btn-reactivate-product" data-id="${product.id}" title="Reativar"><i class="bi bi-check-circle-fill"></i></button>`;

                item.innerHTML = `
                    <div class="list-item-info">
                        <img src="${imageUrl}" alt="${product.nome}" class="list-item-image">
                        <div>
                            <h6>${product.nome} ${!product.ativo ? '<span class="status-badge">Inativo</span>' : ''}</h6>
                            <small>R$ ${product.preco.toFixed(2)} | Categoria: ${product.categoria}</small>
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn edit btn-edit-product" data-id="${product.id}" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                        ${actionButton}
                    </div>
                `;
                UI.productList.appendChild(item);
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            UI.productList.innerHTML = '<p style="color: red;">Não foi possível carregar os produtos.</p>';
        }
    };

    const handleStartEditProduct = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/produtos/${productId}`);
            const product = await response.json();
            UI.productIdInput.value = product.id;
            UI.productNameInput.value = product.nome;
            UI.productPriceInput.value = product.preco;
            UI.productCategoryInput.value = product.categoria;
            UI.productDescriptionInput.value = product.descricao;
            UI.productFormTitle.textContent = 'Editar Produto';
            UI.btnCancelEdit.classList.remove('hidden');
            UI.productForm.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erro ao buscar dados do produto para edição:', error);
        }
    };
    
    const handleDeleteProduct = async (productId) => {
        if (!confirm('Tem certeza que deseja desativar este produto?')) return;
        try {
            await fetch(`${API_URL}/produtos/${productId}`, { method: 'DELETE' });
            await fetchAndRenderProducts();
        } catch(error) {
            alert(error.message);
        }
    };

    const handleReactivateProduct = async (productId) => {
        if (!confirm('Deseja reativar este produto?')) return;
        try {
            await fetch(`${API_URL}/produtos/${productId}/reactivate`, { method: 'PATCH' });
            await fetchAndRenderProducts();
        } catch(error) {
            alert(error.message);
        }
    };

    const fetchAndRenderCustomers = async () => {
        try {
            const response = await fetch(`${API_URL}/clientes`);
            const customers = await response.json();
            const table = document.createElement('table');
            table.className = 'admin-table';
            table.innerHTML = `
                <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Documento</th></tr></thead>
                <tbody>${customers.map(c => `<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.email}</td><td>${c.documento}</td></tr>`).join('')}</tbody>`;
            UI.customerList.innerHTML = '';
            UI.customerList.appendChild(table);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    const fetchAndRenderOrders = async () => {
         try {
            const response = await fetch(`${API_URL}/pedidos`);
            const orders = await response.json();
            const table = document.createElement('table');
            table.className = 'admin-table';
            table.innerHTML = `
                <thead><tr><th>ID Pedido</th><th>ID Cliente</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>${orders.map(o => `<tr><td>${o.id}</td><td>${o.cliente_id}</td><td>R$ ${o.total.toFixed(2)}</td><td><span class="status-badge">${o.status}</span></td></tr>`).join('')}</tbody>`;
            UI.orderList.innerHTML = '';
            UI.orderList.appendChild(table);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        }
    };
    
    const setupEventListeners = () => {
        // ==========================================================
        //  A ÚNICA MUDANÇA ESTÁ AQUI DENTRO
        // ==========================================================
        UI.productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = UI.productIdInput.value;
            const isEditing = !!productId;

            // CORREÇÃO: Construindo o FormData manualmente para garantir que todos os campos sejam incluídos.
            const formData = new FormData();
            formData.append('nome', UI.productNameInput.value);
            formData.append('preco', UI.productPriceInput.value);
            formData.append('categoria', UI.productCategoryInput.value);
            formData.append('descricao', UI.productDescriptionInput.value);
            formData.append('ativo', 'true'); // Produtos gerenciados aqui estão sempre ativos ou sendo reativados

            const imagemInput = document.getElementById('produto-imagem');
            if (imagemInput.files[0]) {
                formData.append('imagem', imagemInput.files[0]);
            }

            const url = isEditing ? `${API_URL}/produtos/${productId}` : `${API_URL}/produtos`;
            const method = isEditing ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, { method, body: formData });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro ao salvar produto.');
                }
                resetProductForm();
                await fetchAndRenderProducts();
            } catch(error) {
                console.error('Erro ao salvar produto:', error);
                alert(error.message);
            }
        });

        UI.productList.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-id]');
            if (!button) return;
            const productId = button.dataset.id;
            if (button.classList.contains('btn-edit-product')) handleStartEditProduct(productId);
            if (button.classList.contains('btn-delete-product')) handleDeleteProduct(productId);
            if (button.classList.contains('btn-reactivate-product')) handleReactivateProduct(productId);
        });

        UI.btnCancelEdit.addEventListener('click', resetProductForm);

        UI.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                UI.tabs.forEach(t => t.classList.remove('active'));
                UI.tabContents.forEach(c => c.style.display = 'none');
                
                tab.classList.add('active');
                const activeTabContent = document.getElementById(tab.dataset.tab);
                activeTabContent.style.display = 'block';
                activeTabContent.classList.add('active');
            });
        });
    };

    const init = () => {
        setupEventListeners();
        fetchAndRenderProducts();
        fetchAndRenderCustomers();
        fetchAndRenderOrders();
    };

    init();
});
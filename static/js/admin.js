// static/admin.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    //  1. VERIFICAÇÃO DE SEGURANÇA E INICIALIZAÇÃO
    // =================================================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Se não há usuário logado ou se o usuário não é admin, redireciona para a loja
    if (!currentUser || !currentUser.isAdmin) {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = 'index.html';
        return; // Interrompe a execução do script
    }

    const API_URL = '/api';

    // Mapeamento dos elementos da UI
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
    };

    // =================================================================
    //  2. GERENCIAMENTO DE PRODUTOS
    // =================================================================

    /** Limpa o formulário de produto e o retorna ao modo "Adicionar" */
    const resetProductForm = () => {
        UI.productForm.reset(); // Limpa todos os campos
        UI.productIdInput.value = ''; // Garante que o ID oculto está vazio
        UI.productFormTitle.textContent = 'Adicionar Novo Produto';
        UI.btnCancelEdit.classList.add('d-none'); // Esconde o botão de cancelar
    };

    /** Busca e renderiza a lista de produtos (ativos e inativos) */
    const fetchAndRenderProducts = async () => {
        try {
            // Chama a nova rota de admin que busca TODOS os produtos
            const response = await fetch(`${API_URL}/produtos/admin`);
            const products = await response.json();
            
            UI.productList.innerHTML = ''; // Limpa a lista atual
            if (products.length === 0) {
                UI.productList.innerHTML = '<p class="text-center">Nenhum produto cadastrado.</p>';
                return;
            }

            products.forEach(product => {
                const item = document.createElement('div');
                
                // Se o produto estiver inativo, adiciona uma classe para deixá-lo cinza
                const itemClass = product.ativo 
                    ? 'list-group-item' 
                    : 'list-group-item list-group-item-secondary';

                item.className = `${itemClass} d-flex justify-content-between align-items-center`;

                // Lógica para mostrar o botão correto: "Excluir" para ativos, "Reativar" para inativos
                const actionButton = product.ativo
                    ? `<button class="btn btn-sm btn-outline-danger btn-delete-product" data-id="${product.id}">
                           <i class="bi bi-trash-fill"></i> Excluir
                       </button>`
                    : `<button class="btn btn-sm btn-success btn-reactivate-product" data-id="${product.id}">
                           <i class="bi bi-check-circle-fill"></i> Reativar
                       </button>`;

                item.innerHTML = `
                    <div>
                        <h6 class="mb-1">${product.nome} ${!product.ativo ? '<span class="badge bg-secondary">Inativo</span>' : ''}</h6>
                        <small>Preço: R$ ${product.preco.toFixed(2)} | Categoria: ${product.categoria}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary btn-edit-product" data-id="${product.id}">
                            <i class="bi bi-pencil-fill"></i> Editar
                        </button>
                        ${actionButton}
                    </div>
                `;
                UI.productList.appendChild(item);
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            UI.productList.innerHTML = '<p class="text-danger">Não foi possível carregar os produtos.</p>';
        }
    };

    /** Prepara o formulário para editar um produto existente */
    const handleStartEditProduct = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/produtos/${productId}`);
            const product = await response.json();

            // Preenche o formulário com os dados do produto
            UI.productIdInput.value = product.id;
            UI.productNameInput.value = product.nome;
            UI.productPriceInput.value = product.preco;
            UI.productCategoryInput.value = product.categoria;
            UI.productDescriptionInput.value = product.descricao;

            // Altera a UI para o modo de edição
            UI.productFormTitle.textContent = 'Editar Produto';
            UI.btnCancelEdit.classList.remove('d-none');
            window.scrollTo(0, 0); // Rola a página para o topo para ver o formulário
        } catch (error) {
            console.error('Erro ao buscar dados do produto para edição:', error);
        }
    };
    
    /** Desativa (soft delete) um produto */
    const handleDeleteProduct = async (productId) => {
        if (!confirm('Tem certeza que deseja desativar este produto? Ele não aparecerá mais na loja.')) return;

        try {
            const response = await fetch(`${API_URL}/produtos/${productId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao desativar o produto.');
            
            await fetchAndRenderProducts(); // Atualiza a lista
        } catch(error) {
            console.error('Erro ao desativar produto:', error);
            alert(error.message);
        }
    };

    /** Reativa um produto */
    const handleReactivateProduct = async (productId) => {
        if (!confirm('Deseja reativar este produto? Ele voltará a aparecer na loja.')) return;
        
        try {
            const response = await fetch(`${API_URL}/produtos/${productId}/reactivate`, { method: 'PATCH' });
            if (!response.ok) throw new Error('Falha ao reativar o produto.');
            
            await fetchAndRenderProducts(); // Atualiza a lista
        } catch(error) {
            console.error('Erro ao reativar produto:', error);
            alert(error.message);
        }
    };

    // =================================================================
    //  AJUSTE PRINCIPAL PARA UPLOAD DE IMAGEM
    // =================================================================
    /** Lida com o envio do formulário para criar ou atualizar um produto */
    UI.productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const productId = UI.productIdInput.value;
        const isEditing = !!productId;

        // Usa FormData para poder enviar o arquivo da imagem junto com os dados
        const formData = new FormData();
        formData.append('nome', UI.productNameInput.value);
        formData.append('preco', parseFloat(UI.productPriceInput.value));
        formData.append('categoria', UI.productCategoryInput.value);
        formData.append('descricao', UI.productDescriptionInput.value);
        formData.append('ativo', true);

        // Pega o campo de input da imagem
        const imagemInput = document.getElementById('produto-imagem');
        // Se um arquivo foi selecionado, anexa ele ao FormData
        if (imagemInput.files[0]) {
            formData.append('imagem', imagemInput.files[0]);
        }

        const url = isEditing ? `${API_URL}/produtos/${productId}` : `${API_URL}/produtos`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                // Não definimos o 'Content-Type', o navegador faz isso
                // automaticamente quando o body é um FormData.
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar produto.');
            }
            
            resetProductForm();
            await fetchAndRenderProducts();

        } catch(error) {
            console.error('Erro ao salvar produto:', error);
            alert(error.message);
        }
    });


    // =================================================================
    //  3. VISUALIZAÇÃO DE CLIENTES E PEDIDOS
    // =================================================================

    /** Busca e renderiza a lista de clientes */
    const fetchAndRenderCustomers = async () => {
        try {
            const response = await fetch(`${API_URL}/clientes`);
            const customers = await response.json();
            
            UI.customerList.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Documento</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.nome}</td>
                            <td>${c.email}</td>
                            <td>${c.documento}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            UI.customerList.appendChild(table);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    /** Busca e renderiza a lista de pedidos */
    const fetchAndRenderOrders = async () => {
         try {
            const response = await fetch(`${API_URL}/pedidos`);
            const orders = await response.json();
            
            UI.orderList.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>ID Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>${o.id}</td>
                            <td>${o.cliente_id}</td>
                            <td>R$ ${o.total.toFixed(2)}</td>
                            <td><span class="badge bg-primary">${o.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            UI.orderList.appendChild(table);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        }
    };


    // =================================================================
    //  4. EVENT LISTENERS E INICIALIZAÇÃO GERAL
    // =================================================================
    
    /** Configura os event listeners da página */
    const setupEventListeners = () => {
        // Usa event delegation para os botões da lista de produtos
        UI.productList.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const productId = button.dataset.id;
            if (button.classList.contains('btn-edit-product')) {
                handleStartEditProduct(productId);
            }
            if (button.classList.contains('btn-delete-product')) {
                handleDeleteProduct(productId);
            }
            if (button.classList.contains('btn-reactivate-product')) {
                handleReactivateProduct(productId);
            }
        });

        // Listener para o botão de cancelar edição
        UI.btnCancelEdit.addEventListener('click', resetProductForm);
    };

    /** Função principal de inicialização */
    const init = () => {
        setupEventListeners();
        fetchAndRenderProducts();
        fetchAndRenderCustomers();
        fetchAndRenderOrders();
    };

    init();
});
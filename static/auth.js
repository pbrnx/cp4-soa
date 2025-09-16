// static/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api';

    // Seleciona os formulários
    const loginForm = document.getElementById('login-form');
    const cadastroForm = document.getElementById('cadastro-form');

    // =================================================================
    //  LÓGICA PARA A PÁGINA DE CADASTRO
    // =================================================================
    if (cadastroForm) {
        const successAlert = document.getElementById('cadastro-success');
        const errorAlert = document.getElementById('cadastro-error');

        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Pega os dados do formulário
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const documento = document.getElementById('documento').value;
            const password = document.getElementById('password').value; // A senha não será usada no backend atual, mas é bom coletar

            // Esconde alertas antigos
            successAlert.classList.add('d-none');
            errorAlert.classList.add('d-none');

            try {
                const response = await fetch(`${API_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, documento })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao cadastrar. Tente novamente.');
                }

                // Se o cadastro deu certo
                successAlert.classList.remove('d-none');
                
                // Redireciona para a página de login após 2 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            }
        });
    }


    // =================================================================
    //  LÓGICA PARA A PÁGINA DE LOGIN
    // =================================================================
    if (loginForm) {
        const errorAlert = document.getElementById('login-error');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value; // Não usado para autenticar, mas necessário no form

            errorAlert.classList.add('d-none');

            // --- AVISO IMPORTANTE ---
            // A API atual não tem um endpoint de autenticação (ex: POST /api/login).
            // Por isso, vamos SIMULAR o login: buscamos todos os clientes e encontramos
            // um com o e-mail correspondente. Isso NUNCA deve ser feito em produção
            // por ser inseguro e ineficiente, mas funciona para este projeto.
            try {
                const response = await fetch(`${API_URL}/clientes`);
                if (!response.ok) throw new Error('Não foi possível conectar ao servidor.');

                const clientes = await response.json();
                const clienteEncontrado = clientes.find(cliente => cliente.email === email);
                
                if (clienteEncontrado) {
                    // Login bem-sucedido!
                    // Guardamos as informações do usuário no localStorage do navegador
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: clienteEncontrado.id,
                        nome: clienteEncontrado.nome,
                        // Vamos adicionar uma propriedade 'isAdmin' para simular um admin
                        // Troque para 'true' se quiser que este usuário seja admin
                        isAdmin: clienteEncontrado.email.includes('admin') // Ex: se o email for 'admin@quality.com'
                    }));

                    // Redireciona para a página inicial
                    window.location.href = 'index.html';

                } else {
                    // Cliente não encontrado
                    throw new Error('E-mail ou senha inválidos.');
                }

            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            }
        });
    }
});
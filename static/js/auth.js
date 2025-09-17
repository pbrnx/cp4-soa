// static/js/auth.js

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
    //  LÓGICA PARA A PÁGINA DE LOGIN (ATUALIZADA)
    // =================================================================
    if (loginForm) {
        const errorAlert = document.getElementById('login-error');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            errorAlert.classList.add('d-none');

            try {
                // Chama o novo endpoint de autenticação no backend
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha na autenticação.');
                }
                
                const userData = await response.json();

                // Login bem-sucedido!
                // Guardamos as informações do usuário no localStorage
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Redireciona para a página correta (admin ou index)
                if (userData.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            }
        });
    }
});
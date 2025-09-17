// static/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api';

    const loginForm = document.getElementById('login-form');
    const cadastroForm = document.getElementById('cadastro-form');

    // =================================================================
    //  FUNÇÕES DE VALIDAÇÃO E FORMATAÇÃO DE CPF
    // =================================================================

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return cpf;
    }

    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }

    // =================================================================
    //  LÓGICA PARA A PÁGINA DE CADASTRO
    // =================================================================
    if (cadastroForm) {
        const successAlert = document.getElementById('cadastro-success');
        const errorAlert = document.getElementById('cadastro-error');
        const documentoInput = document.getElementById('documento');

        documentoInput.addEventListener('input', (event) => {
            event.target.value = formatarCPF(event.target.value);
        });

        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            successAlert.classList.add('hidden');
            errorAlert.classList.add('hidden');

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const documento = documentoInput.value;
            // O campo de senha é lido mas não é enviado, conforme solicitado.

            if (!validarCPF(documento)) {
                errorAlert.textContent = 'CPF inválido. Por favor, verifique o documento inserido.';
                errorAlert.classList.remove('hidden');
                return;
            }

            const documentoApenasNumeros = documento.replace(/\D/g, '');

            try {
                const response = await fetch(`${API_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Enviamos apenas os dados que o backend espera, ignorando a senha.
                    body: JSON.stringify({ nome, email, documento: documentoApenasNumeros })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao cadastrar. Tente novamente.');
                }

                successAlert.classList.remove('hidden');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('hidden');
            }
        });
    }

    // =================================================================
    //  LÓGICA PARA A PÁGINA DE LOGIN (Lógica Original)
    // =================================================================
    if (loginForm) {
        const errorAlert = document.getElementById('login-error');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            errorAlert.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'E-mail ou senha inválidos.');
                }

                const userData = await response.json();
                localStorage.setItem('currentUser', JSON.stringify(userData));

                if (userData.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('hidden');
            }
        });
    }
});
// static/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api';

    // Seleciona os formulários
    const loginForm = document.getElementById('login-form');
    const cadastroForm = document.getElementById('cadastro-form');

    // =================================================================
    //  FUNÇÕES DE VALIDAÇÃO E FORMATAÇÃO DE CPF
    // =================================================================

    /** Formata o valor do campo para o formato de CPF (XXX.XXX.XXX-XX) */
    function formatarCPF(cpf) {
        // Remove tudo que não for dígito
        cpf = cpf.replace(/\D/g, '');

        // Aplica a máscara
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        return cpf;
    }

    /** Valida se um CPF é válido (algoritmo de validação) */
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }


    // =================================================================
    //  LÓGICA PARA A PÁGINA DE CADASTRO (ATUALIZADA)
    // =================================================================
    if (cadastroForm) {
        const successAlert = document.getElementById('cadastro-success');
        const errorAlert = document.getElementById('cadastro-error');
        const documentoInput = document.getElementById('documento');

        // Adiciona o listener para formatar o CPF enquanto digita
        documentoInput.addEventListener('input', (event) => {
            const valorFormatado = formatarCPF(event.target.value);
            event.target.value = valorFormatado;
        });


        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Esconde alertas antigos
            successAlert.classList.add('d-none');
            errorAlert.classList.add('d-none');

            // Pega os dados do formulário
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const documento = documentoInput.value;
            const password = document.getElementById('password').value;

            // **NOVA ETAPA: Validação do CPF**
            if (!validarCPF(documento)) {
                errorAlert.textContent = 'CPF inválido. Por favor, verifique o documento inserido.';
                errorAlert.classList.remove('d-none');
                return; // Interrompe o envio do formulário
            }

            // Remove a formatação para enviar apenas os números
            const documentoApenasNumeros = documento.replace(/\D/g, '');

            try {
                const response = await fetch(`${API_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, documento: documentoApenasNumeros })
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
    //  LÓGICA PARA A PÁGINA DE LOGIN (sem alterações)
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
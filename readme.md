# QualityStore E-commerce API
API REST completa para gerenciar clientes, produtos, carrinhos, pedidos e pagamentos da loja QualityStore. O projeto segue as boas práticas de desenvolvimento, utilizando uma arquitetura em camadas (Controllers, Services, Repositories) e documentação via Swagger.

---

## Integrantes do Grupo
- Nome: Pedro Augusto Carneiro Barone Bomfim - RM: 99781 
- Nome: João Pedro de Albuquerque Oliveira - RM: 551579
- Nome: Matheus Augusto Santos Rego - RM:551466
- Nome: Ian Cancian Nachtergaele - RM: 98387

---
## Como usar?
O deploy da aplicação foi feito no render, nesse link: https://cp4-soa.onrender.com

Para acessar a relação de endpoints, use a rota https://cp4-soa.onrender.com/api-docs. É possível testar todos os endpoints por meio da interface do OpenAPI (Swagger)

<img width="1904" height="949" alt="image" src="https://github.com/user-attachments/assets/67c92779-319d-4a09-aafc-59790ecebdd3" />


Para acessar o frontend, use a rota https://cp4-soa.onrender.com/pages

<img width="1899" height="954" alt="image" src="https://github.com/user-attachments/assets/e98a3b80-34d0-4120-bce6-61f05537db61" />

---
## Tecnologias Utilizadas
- **Backend:** Node.js com Express.js
- **Banco de Dados:** Oracle Database (Cloud FIAP)
- **Driver Oracle:** oracledb
- **Documentação:** Swagger UI com swagger-ui-express e yamljs
- **Variáveis de Ambiente:** dotenv
- **Upload de Arquivos:** multer

---

## 1. Pré-requisitos (execução local)
### 1.1. Node.js
Node.js (versão 18 ou superior): Essencial para rodar o servidor da aplicação.  
Para instalar, acesse o site oficial: [nodejs.org](https://nodejs.org)

---

## 2. Configuração do Banco de Dados
Execute o script SQL abaixo para criar todas as tabelas necessárias:

```sql
-- Limpar antigas (se existirem)
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE pagamento CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE item_pedido CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE pedido CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE item_carrinho CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE produto CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE carrinho CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE cliente CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- CLIENTE
CREATE TABLE cliente (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(150) NOT NULL,
    email VARCHAR2(150) NOT NULL,
    documento VARCHAR2(30) NOT NULL,
    CONSTRAINT uq_cliente_email UNIQUE (email)
);

-- CARRINHO
CREATE TABLE carrinho (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id NUMBER(19) NOT NULL,
    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (cliente_id)
        REFERENCES cliente(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_carrinho_cliente UNIQUE (cliente_id)
);

-- PRODUTO
CREATE TABLE produto (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(120) NOT NULL,
    preco NUMBER(10,2) NOT NULL,
    categoria VARCHAR2(60),
    descricao CLOB,
    ativo NUMBER(1) DEFAULT 1 NOT NULL,
    imagem_url VARCHAR(1000)
);

-- ITEM_CARRINHO
CREATE TABLE item_carrinho (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    carrinho_id NUMBER(19) NOT NULL,
    produto_id NUMBER(19) NOT NULL,
    quantidade NUMBER(10) NOT NULL,
    preco_unitario NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_itemcarrinho_carrinho FOREIGN KEY (carrinho_id)
        REFERENCES carrinho(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_itemcarrinho_produto FOREIGN KEY (produto_id)
        REFERENCES produto(id)
);

-- PEDIDO
CREATE TABLE pedido (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id NUMBER(19) NOT NULL,
    total NUMBER(10,2) NOT NULL,
    status VARCHAR2(30) NOT NULL,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id)
        REFERENCES cliente(id)
);

-- ITEM_PEDIDO
CREATE TABLE item_pedido (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id NUMBER(19) NOT NULL,
    produto_id NUMBER(19) NOT NULL,
    quantidade NUMBER(10) NOT NULL,
    preco_unitario NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_itempedido_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedido(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_itempedido_produto FOREIGN KEY (produto_id)
        REFERENCES produto(id)
);

-- PAGAMENTO
CREATE TABLE pagamento (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id NUMBER(19) NOT NULL,
    valor NUMBER(10,2) NOT NULL,
    status VARCHAR2(30) NOT NULL,
    metodo VARCHAR2(40) NOT NULL,
    CONSTRAINT fk_pagamento_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedido(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_pagamento_pedido UNIQUE (pedido_id)
);
```

---

## 3. Instalação e Execução do Projeto
### Passo 1: Clone o Repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_DIRETORIO>
```

### Passo 2: Crie o arquivo de Variáveis de Ambiente
Crie um arquivo chamado **.env** na raiz do projeto e preencha com suas credenciais:

```env
# Credenciais do Banco de Dados Oracle
DB_USER=seu_usuario_oracle
DB_PASSWORD=sua_senha_oracle
DB_URL=oracle.fiap.com.br:1521/ORCL

# Credenciais do Administrador
ADMIN_USER=admin@admin.com
ADMIN_PASSWORD=12345
```

### Passo 3: Instale as Dependências
```bash
npm install
```

### Passo 4: Inicie o Servidor
```bash
node app.js
```

Se tudo estiver correto, você verá no console:
```
Servidor rodando na porta 3000
Acesse a documentação em http://localhost:3000/api-docs 
```
<img width="970" height="196" alt="image" src="https://github.com/user-attachments/assets/cf123040-6923-48ff-93dc-445953a2ab4e" />

---

## 4. Acesso à Documentação (Swagger)
Com o servidor rodando, acesse:
```
http://localhost:3000/api-docs
```

---

## 5. Testando a API
Na documentação do Swagger, é possível testar todos os endpoints disponíveis, com todos os verbos de cada processo. É possíve:
- Criar um cliente.
- Criar um produto.
- Adicionar o produto ao carrinho.
- Remover um item temporário do carrinho.
- Criar um pedido a partir do carrinho.
- Realizar o pagamento.
- Entre outros

Para executar, acesse a rota:
```bash
localhost:3000/api-docs 
```
ou 
```bash
https://cp4-soa.onrender.com/api-docs
```
<img width="1904" height="949" alt="image" src="https://github.com/user-attachments/assets/e2f09904-54a3-4133-8bed-b04abd137cee" />

---

## 6. Estrutura do Projeto
```
src/
 ├─ controllers/   # Recebem requisições HTTP, validam dados e retornam respostas
 ├─ services/      # Lógica de negócio
 ├─ repositories/  # Acesso ao banco de dados
 ├─ models/        # Entidades do domínio
 ├─ routes/        # Definição dos endpoints
 ├─ dtos/          # Transporte de dados entre camadas
 ├─ config/        # Configurações do banco e upload
static/            # Interface frontend para testes
swagger.yaml       # Definição da documentação Swagger
```

---

## 7. Decisões de Design e Limitações
- **Autenticação:** Sistema simplificado. Clientes usam apenas email; admin definido por variáveis de ambiente. Em produção, recomendável usar senha com hash e JWT.
- **Soft Delete:** Exclusão de produtos feita com flag `ativo=false`.
- **Transações:** Operações críticas (pedido, pagamento) usam transações para consistência.
- **Frontend:** Implementação básica apenas para testes visuais da API.

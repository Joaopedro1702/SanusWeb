-- =========================================================
-- SANUS_DB - VERSAO POSTGRESQL
-- =========================================================
-- Antes de rodar este script, crie o banco (uma vez) e conecte nele:
--   CREATE DATABASE sanus_db;
--   \c sanus_db
-- Rodar com:  psql "$DATABASE_URL" -f schema_postgres.sql
-- =========================================================


-- =========================================================
-- LIMPAR BANCO
-- =========================================================

DROP TABLE IF EXISTS tbl_produto_venda CASCADE;
DROP TABLE IF EXISTS tbl_pagamento_venda CASCADE;
DROP TABLE IF EXISTS tbl_venda CASCADE;
DROP TABLE IF EXISTS tbl_estoque CASCADE;
DROP TABLE IF EXISTS tbl_lote CASCADE;
DROP TABLE IF EXISTS tbl_produto_compra CASCADE;
DROP TABLE IF EXISTS tbl_compra CASCADE;
DROP TABLE IF EXISTS tbl_produto CASCADE;
DROP TABLE IF EXISTS tbl_cliente_endereco CASCADE;
DROP TABLE IF EXISTS tbl_fornecedor_endereco CASCADE;
DROP TABLE IF EXISTS tbl_endereco CASCADE;
DROP TABLE IF EXISTS tbl_funcionario CASCADE;
DROP TABLE IF EXISTS tbl_cliente CASCADE;
DROP TABLE IF EXISTS tbl_telefone_usuario CASCADE;
DROP TABLE IF EXISTS tbl_usuario CASCADE;
DROP TABLE IF EXISTS tbl_telefone_fornecedor CASCADE;
DROP TABLE IF EXISTS tbl_fornecedor CASCADE;


-- =========================================================
-- FORNECEDOR
-- =========================================================

CREATE TABLE tbl_fornecedor (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj CHAR(14) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);


-- =========================================================
-- TELEFONE FORNECEDOR
-- =========================================================

CREATE TABLE tbl_telefone_fornecedor (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    telefone VARCHAR(14),

    FOREIGN KEY (id_fornecedor)
        REFERENCES tbl_fornecedor(id)
);


-- =========================================================
-- USUARIO
-- =========================================================

CREATE TABLE tbl_usuario (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nasc DATE NOT NULL
);


-- =========================================================
-- TELEFONE USUARIO
-- =========================================================

CREATE TABLE tbl_telefone_usuario (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    telefone CHAR(14) NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES tbl_usuario(id)
);


-- =========================================================
-- CLIENTE
-- =========================================================

CREATE TABLE tbl_cliente (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    aceita_ofertas BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id_usuario)
        REFERENCES tbl_usuario(id)
);


-- =========================================================
-- FUNCIONARIO
-- =========================================================

CREATE TABLE tbl_funcionario (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    data_admissao DATE NOT NULL,
    cargo VARCHAR(50) NOT NULL,

    situacao VARCHAR(20) NOT NULL,

    CONSTRAINT constsituacao
        CHECK (situacao IN ('Ativo', 'Afastado', 'Demitido')),

    FOREIGN KEY (id_usuario)
        REFERENCES tbl_usuario(id)
);


-- =========================================================
-- ENDERECO
-- =========================================================

CREATE TABLE tbl_endereco (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(50) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL
);


-- =========================================================
-- FORNECEDOR ENDERECO
-- =========================================================

CREATE TABLE tbl_fornecedor_endereco (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    id_endereco INT NOT NULL,
    numero VARCHAR(5) NOT NULL,
    complemento VARCHAR(20),
    referencia VARCHAR(100),

    FOREIGN KEY (id_endereco)
        REFERENCES tbl_endereco(id),

    FOREIGN KEY (id_fornecedor)
        REFERENCES tbl_fornecedor(id)
);


-- =========================================================
-- CLIENTE ENDERECO
-- =========================================================

CREATE TABLE tbl_cliente_endereco (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_endereco INT NOT NULL,
    id_cliente INT NOT NULL,
    numero VARCHAR(5) NOT NULL,
    complemento VARCHAR(20),
    referencia VARCHAR(100),

    FOREIGN KEY (id_endereco)
        REFERENCES tbl_endereco(id),

    FOREIGN KEY (id_cliente)
        REFERENCES tbl_cliente(id)
);


-- =========================================================
-- PRODUTO
-- =========================================================

CREATE TABLE tbl_produto (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco NUMERIC(7,2) NOT NULL,
    tarja VARCHAR(20) NOT NULL
);


-- =========================================================
-- COMPRA
-- =========================================================

CREATE TABLE tbl_compra (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    data_compra DATE NOT NULL,
    total_compra NUMERIC(10,2),

    FOREIGN KEY (id_fornecedor)
        REFERENCES tbl_fornecedor(id)
);


-- =========================================================
-- PRODUTO COMPRA
-- =========================================================

CREATE TABLE tbl_produto_compra (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produto INT NOT NULL,
    id_compra INT NOT NULL,
    qnt INT NOT NULL,
    valor_unitario NUMERIC(8,2) NOT NULL,

    FOREIGN KEY (id_produto)
        REFERENCES tbl_produto(id),

    FOREIGN KEY (id_compra)
        REFERENCES tbl_compra(id)
);


-- =========================================================
-- LOTE
-- =========================================================

CREATE TABLE tbl_lote (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produto_compra INT NOT NULL,
    cod VARCHAR(10) NOT NULL,
    qnt INT NOT NULL,
    validade DATE NOT NULL,

    FOREIGN KEY (id_produto_compra)
        REFERENCES tbl_produto_compra(id)
);


-- =========================================================
-- ESTOQUE
-- =========================================================

CREATE TABLE tbl_estoque (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_lote INT NOT NULL,
    posicao VARCHAR(30) NOT NULL,

    FOREIGN KEY (id_lote)
        REFERENCES tbl_lote(id)
);


-- =========================================================
-- VENDA
-- =========================================================

CREATE TABLE tbl_venda (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_funcionario INT NOT NULL,
    nfe VARCHAR(100) NOT NULL,
    valor NUMERIC(8,2) NOT NULL,
    data_venda TIMESTAMP NOT NULL,
    canal_venda VARCHAR(20) NOT NULL,

    FOREIGN KEY (id_cliente)
        REFERENCES tbl_cliente(id),

    FOREIGN KEY (id_funcionario)
        REFERENCES tbl_funcionario(id)
);


-- =========================================================
-- PAGAMENTO VENDA
-- =========================================================

CREATE TABLE tbl_pagamento_venda (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venda INT NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL,
    valor_pago NUMERIC(10,2) NOT NULL,
    valor_recebido NUMERIC(10,2),
    troco NUMERIC(10,2),
    situacao VARCHAR(20) NOT NULL,

    FOREIGN KEY (id_venda)
        REFERENCES tbl_venda(id)
);


-- =========================================================
-- PRODUTO VENDA
-- =========================================================

CREATE TABLE tbl_produto_venda (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    qnt INT NOT NULL,
    valor_unitario NUMERIC(8,2) NOT NULL,

    FOREIGN KEY (id_venda)
        REFERENCES tbl_venda(id),

    FOREIGN KEY (id_produto)
        REFERENCES tbl_produto(id)
);

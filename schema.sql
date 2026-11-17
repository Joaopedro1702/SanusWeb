-- =========================================================
-- BANCO DE DADOS
-- =========================================================

CREATE DATABASE IF NOT EXISTS sanus_Db;

USE sanus_Db;


-- =========================================================
-- LIMPAR BANCO
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Tbl_Produto_Venda;
DROP TABLE IF EXISTS Tbl_Pagamento_Venda;
DROP TABLE IF EXISTS Tbl_Venda;
DROP TABLE IF EXISTS Tbl_Estoque;
DROP TABLE IF EXISTS Tbl_Lote;
DROP TABLE IF EXISTS Tbl_Produto_Compra;
DROP TABLE IF EXISTS Tbl_Compra;
DROP TABLE IF EXISTS Tbl_Cliente_Endereco;
DROP TABLE IF EXISTS Tbl_Fornecedor_Endereco;
DROP TABLE IF EXISTS Tbl_Endereco;
DROP TABLE IF EXISTS Tbl_Funcionario;
DROP TABLE IF EXISTS Tbl_Cliente;
DROP TABLE IF EXISTS Tbl_Telefone_Usuario;
DROP TABLE IF EXISTS Tbl_Usuario;
DROP TABLE IF EXISTS Tbl_Telefone_Fornecedor;
DROP TABLE IF EXISTS Tbl_Fornecedor;

SET FOREIGN_KEY_CHECKS = 1;


-- =========================================================
-- FORNECEDOR
-- =========================================================

CREATE TABLE Tbl_Fornecedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj CHAR(14) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);


-- =========================================================
-- TELEFONE FORNECEDOR
-- =========================================================

CREATE TABLE Tbl_Telefone_Fornecedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Fornecedor INT NOT NULL,
    telefone VARCHAR(14),

    FOREIGN KEY (id_Fornecedor)
        REFERENCES Tbl_Fornecedor(id)
);


-- =========================================================
-- USUARIO
-- =========================================================

CREATE TABLE Tbl_Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_Nasc DATE NOT NULL
);


-- =========================================================
-- TELEFONE USUARIO
-- =========================================================

CREATE TABLE Tbl_Telefone_Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    telefone CHAR(14) NOT NULL,

    FOREIGN KEY (id_Usuario)
        REFERENCES Tbl_Usuario(id)
);


-- =========================================================
-- CLIENTE
-- =========================================================

CREATE TABLE Tbl_Cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    aceita_Ofertas BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id_Usuario)
        REFERENCES Tbl_Usuario(id)
);


-- =========================================================
-- FUNCIONARIO
-- =========================================================

CREATE TABLE Tbl_Funcionario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    data_Admissao DATE NOT NULL,
    cargo VARCHAR(50) NOT NULL,

    situacao VARCHAR(20) NOT NULL,

    CONSTRAINT constSituacao
        CHECK (situacao IN ('Ativo', 'Afastado', 'Demitido')),

    FOREIGN KEY (id_Usuario)
        REFERENCES Tbl_Usuario(id)
);


-- =========================================================
-- ENDERECO
-- =========================================================

CREATE TABLE Tbl_Endereco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(50) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL
);


-- =========================================================
-- FORNECEDOR ENDERECO
-- =========================================================

CREATE TABLE Tbl_Fornecedor_Endereco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Fornecedor INT NOT NULL,
    id_Endereco INT NOT NULL,
    numero VARCHAR(5) NOT NULL,
    complemento VARCHAR(20),
    referencia VARCHAR(100),

    FOREIGN KEY (id_Endereco)
        REFERENCES Tbl_Endereco(id),

    FOREIGN KEY (id_Fornecedor)
        REFERENCES Tbl_Fornecedor(id)
);


-- =========================================================
-- CLIENTE ENDERECO
-- =========================================================

CREATE TABLE Tbl_Cliente_Endereco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Endereco INT NOT NULL,
    id_Cliente INT NOT NULL,
    numero VARCHAR(5) NOT NULL,
    complemento VARCHAR(20),
    referencia VARCHAR(100),

    FOREIGN KEY (id_Endereco)
        REFERENCES Tbl_Endereco(id),

    FOREIGN KEY (id_Cliente)
        REFERENCES Tbl_Cliente(id)
);


-- =========================================================
-- PRODUTO
-- =========================================================

CREATE TABLE Tbl_Produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco DECIMAL(7,2) NOT NULL,
    tarja VARCHAR(20) NOT NULL
);


-- =========================================================
-- COMPRA
-- =========================================================

CREATE TABLE Tbl_Compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Fornecedor INT NOT NULL,
    data_Compra DATE NOT NULL,
    total_Compra DECIMAL(10,2),

    FOREIGN KEY (id_Fornecedor)
        REFERENCES Tbl_Fornecedor(id)
);


-- =========================================================
-- PRODUTO COMPRA
-- =========================================================

CREATE TABLE Tbl_Produto_Compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Produto INT NOT NULL,
    id_Compra INT NOT NULL,
    qnt INT NOT NULL,
    valor_Unitario DECIMAL(8,2) NOT NULL,

    FOREIGN KEY (id_Produto)
        REFERENCES Tbl_Produto(id),

    FOREIGN KEY (id_Compra)
        REFERENCES Tbl_Compra(id)
);


-- =========================================================
-- LOTE
-- =========================================================

CREATE TABLE Tbl_Lote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Produto_Compra INT NOT NULL,
    cod VARCHAR(10) NOT NULL,
    qnt INT NOT NULL,
    validade DATE NOT NULL,

    FOREIGN KEY (id_Produto_Compra)
        REFERENCES Tbl_Produto_Compra(id)
);


-- =========================================================
-- ESTOQUE
-- =========================================================

CREATE TABLE Tbl_Estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Lote INT NOT NULL,
    posicao VARCHAR(30) NOT NULL,

    FOREIGN KEY (id_Lote)
        REFERENCES Tbl_Lote(id)
);


-- =========================================================
-- VENDA
-- =========================================================

CREATE TABLE Tbl_Venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Cliente INT NOT NULL,
    id_Funcionario INT NOT NULL,
    nfe VARCHAR(100) NOT NULL,
    valor DECIMAL(8,2) NOT NULL,
    data_Venda DATETIME NOT NULL,
    canal_Venda VARCHAR(20) NOT NULL,

    FOREIGN KEY (id_Cliente)
        REFERENCES Tbl_Cliente(id),

    FOREIGN KEY (id_Funcionario)
        REFERENCES Tbl_Funcionario(id)
);


-- =========================================================
-- PAGAMENTO VENDA
-- =========================================================

CREATE TABLE Tbl_Pagamento_Venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Venda INT NOT NULL,
    forma_Pagamento VARCHAR(20) NOT NULL,
    valor_Pago DECIMAL(10,2) NOT NULL,
    valor_Recebido DECIMAL(10,2),
    troco DECIMAL(10,2),
    situacao VARCHAR(20) NOT NULL,

    FOREIGN KEY (id_Venda)
        REFERENCES Tbl_Venda(id)
);


-- =========================================================
-- PRODUTO VENDA
-- =========================================================

CREATE TABLE Tbl_Produto_Venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Venda INT NOT NULL,
    id_Produto INT NOT NULL,
    qnt INT NOT NULL,
    valor_Unitario DECIMAL(8,2) NOT NULL,

    FOREIGN KEY (id_Venda)
        REFERENCES Tbl_Venda(id),

    FOREIGN KEY (id_Produto)
        REFERENCES Tbl_Produto(id)
);

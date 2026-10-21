CREATE DATABASE IF NOT EXISTS `db_indice`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_indice`;

CREATE TABLE IF NOT EXISTS `empresas` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email_rep` varchar(255) NOT NULL,
  `CNPJ` varchar(18) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `email_rep` (`email_rep`),
  UNIQUE KEY `CNPJ` (`CNPJ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produtos_LIVRES` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum(
    'Saneantes Domissanitários de Risco 1',
    'Saneantes Domissanitários de Risco 2 de Venda Livre',
    'Cosméticos, Produtos de Higiene Pessoal e Perfumaria',
    'Tintas Imobiliárias, Vernizes e Seladoras',
    'Adesivos e Colas de Uso Geral',
    'Lubrificantes, Graxas e Fluidos Automotivos',
    'Soluções Orgânicas Diluídas (até 60% de concentração)',
    'Eletrólitos de Bateria Automotiva (até 40% de concentração)',
    'Óleos Essenciais e Preparações Diluídas (até 4% de concentração)',
    'Kits de Química Educacional e Didática'
  ) NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `estoque` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produtos_NAO_LIVRES` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum(
    'Produtos Controlados pela Polícia Federal',
    'Produtos Controlados pelo Exército Brasileiro',
    'Produtos Controlados pela Polícia Civil',
    'Saneantes e Desinfetantes de Uso Hospitalar',
    'Saneantes Restritos ao Uso Profissional',
    'Precursores de Entorpecentes e Psicotrópicos',
    'Precursores de Explosivos',
    'Armas Químicas e Insumos Relacionados',
    'Agrotóxicos e Defensivos Agrícolas Rígidos',
    'Substâncias Químicas Puras e Solventes Concentrados'
  ) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `estoque` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `CPF` varchar(14) NOT NULL,
  `CNPJ` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `CPF` (`CPF`),
  UNIQUE KEY `CNPJ` (`CNPJ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vendas` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_venda` varchar(40) NOT NULL,
  `produto_ID` int(11) NOT NULL,
  `empresa_ID` int(11) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `data_venda` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `codigo_venda` (`codigo_venda`),
  KEY `produto_ID` (`produto_ID`),
  KEY `empresa_ID` (`empresa_ID`),
  CONSTRAINT `vendas_produto_livre_fk`
    FOREIGN KEY (`produto_ID`) REFERENCES `produtos_LIVRES` (`ID`)
    ON UPDATE CASCADE,
  CONSTRAINT `vendas_empresa_fk`
    FOREIGN KEY (`empresa_ID`) REFERENCES `empresas` (`ID`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `empresas` (`nome`, `email_rep`, `CNPJ`, `descricao`)
SELECT
  'Empresa de demonstração',
  'representante@exemplo.invalid',
  '00000000000000',
  'Cadastro fictício utilizado nos dados iniciais do sistema.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `empresas` WHERE `nome` = 'Empresa de demonstração'
);

INSERT INTO `produtos_LIVRES` (`nome`, `categoria`, `preco`, `descricao`, `estoque`)
SELECT
  'Detergente neutro',
  'Saneantes Domissanitários de Risco 1',
  8.90,
  'Produto demonstrativo de venda livre.',
  46
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `produtos_LIVRES` WHERE `nome` = 'Detergente neutro'
);

INSERT INTO `produtos_LIVRES` (`nome`, `categoria`, `preco`, `descricao`, `estoque`)
SELECT
  'Sabonete líquido neutro',
  'Cosméticos, Produtos de Higiene Pessoal e Perfumaria',
  16.50,
  'Produto demonstrativo para higiene pessoal.',
  31
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `produtos_LIVRES` WHERE `nome` = 'Sabonete líquido neutro'
);

INSERT INTO `produtos_LIVRES` (`nome`, `categoria`, `preco`, `descricao`, `estoque`)
SELECT
  'Adesivo de uso geral',
  'Adesivos e Colas de Uso Geral',
  12.00,
  'Produto demonstrativo de uso geral.',
  20
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `produtos_LIVRES` WHERE `nome` = 'Adesivo de uso geral'
);

INSERT INTO `produtos_NAO_LIVRES` (`nome`, `categoria`, `preco`, `descricao`, `estoque`)
SELECT
  'Item controlado de demonstração',
  'Produtos Controlados pela Polícia Civil',
  29.90,
  'Registro fictício para demonstrar o controle de produtos não livres.',
  4
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `produtos_NAO_LIVRES` WHERE `nome` = 'Item controlado de demonstração'
);

INSERT INTO `vendas` (`codigo_venda`, `produto_ID`, `empresa_ID`, `quantidade`, `preco_unitario`, `data_venda`)
SELECT
  'DEMO-20261020-001',
  `produto`.`ID`,
  `empresa`.`ID`,
  2,
  8.90,
  '2026-10-20 10:00:00'
FROM `produtos_LIVRES` AS `produto`
INNER JOIN `empresas` AS `empresa` ON `empresa`.`nome` = 'Empresa de demonstração'
WHERE `produto`.`nome` = 'Detergente neutro'
  AND NOT EXISTS (
    SELECT 1 FROM `vendas` WHERE `codigo_venda` = 'DEMO-20261020-001'
  );

INSERT INTO `vendas` (`codigo_venda`, `produto_ID`, `empresa_ID`, `quantidade`, `preco_unitario`, `data_venda`)
SELECT
  'DEMO-20261020-002',
  `produto`.`ID`,
  `empresa`.`ID`,
  1,
  16.50,
  '2026-10-20 11:30:00'
FROM `produtos_LIVRES` AS `produto`
INNER JOIN `empresas` AS `empresa` ON `empresa`.`nome` = 'Empresa de demonstração'
WHERE `produto`.`nome` = 'Sabonete líquido neutro'
  AND NOT EXISTS (
    SELECT 1 FROM `vendas` WHERE `codigo_venda` = 'DEMO-20261020-002'
  );
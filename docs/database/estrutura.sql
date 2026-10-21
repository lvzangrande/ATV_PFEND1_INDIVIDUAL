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

CREATE TABLE IF NOT EXISTS `ativos_negociaveis` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum(
    'Ações brasileiras',
    'Ações internacionais e BDRs',
    'Fundos imobiliários (FIIs)',
    'Fundos de índice (ETFs)',
    'Criptomoedas',
    'Renda fixa',
    'Commodities',
    'Índices de mercado',
    'Moedas',
    'Fundos de investimento'
  ) NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `posicao` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ativos_monitorados` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum(
    'Opções',
    'Contratos futuros',
    'Derivativos',
    'Ativos em observação',
    'Ativos internacionais',
    'Criptoativos em observação',
    'Renda fixa com vencimento',
    'Fundos fechados',
    'Índices globais',
    'Outros instrumentos financeiros'
  ) NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `posicao` int(11) NOT NULL,
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
  `ativo_ID` int(11) NOT NULL,
  `empresa_ID` int(11) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `data_venda` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `codigo_venda` (`codigo_venda`),
  KEY `ativo_ID` (`ativo_ID`),
  KEY `empresa_ID` (`empresa_ID`),
  CONSTRAINT `vendas_ativo_fk`
    FOREIGN KEY (`ativo_ID`) REFERENCES `ativos_negociaveis` (`ID`)
    ON UPDATE CASCADE,
  CONSTRAINT `vendas_empresa_fk`
    FOREIGN KEY (`empresa_ID`) REFERENCES `empresas` (`ID`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `empresas` (`nome`, `email_rep`, `CNPJ`, `descricao`)
SELECT
  'Corretora Índice Demo',
  'contato@corretora.invalid',
  '00000000000000',
  'Instituição fictícia para demonstração da carteira.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `empresas` WHERE `nome` = 'Corretora Índice Demo'
);

INSERT INTO `ativos_negociaveis` (`nome`, `categoria`, `preco`, `descricao`, `posicao`)
SELECT
  'ETF Brasil Demo',
  'Fundos de índice (ETFs)',
  125.40,
  'Ativo fictício para demonstração; não representa cotação real.',
  12
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `ativos_negociaveis` WHERE `nome` = 'ETF Brasil Demo'
);

INSERT INTO `ativos_negociaveis` (`nome`, `categoria`, `preco`, `descricao`, `posicao`)
SELECT
  'Fundo Imobiliário Demo',
  'Fundos imobiliários (FIIs)',
  98.75,
  'Ativo fictício para demonstração; não representa cotação real.',
  8
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `ativos_negociaveis` WHERE `nome` = 'Fundo Imobiliário Demo'
);

INSERT INTO `ativos_negociaveis` (`nome`, `categoria`, `preco`, `descricao`, `posicao`)
SELECT
  'CDB Demonstração',
  'Renda fixa',
  104.20,
  'Ativo fictício para demonstração; não representa cotação real.',
  5
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `ativos_negociaveis` WHERE `nome` = 'CDB Demonstração'
);

INSERT INTO `ativos_monitorados` (`nome`, `categoria`, `preco`, `descricao`, `posicao`)
SELECT
  'Opção de Compra Demo',
  'Opções',
  NULL,
  'Ativo fictício acompanhado sem negociação por este painel.',
  2
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `ativos_monitorados` WHERE `nome` = 'Opção de Compra Demo'
);

INSERT INTO `vendas` (`codigo_venda`, `ativo_ID`, `empresa_ID`, `quantidade`, `preco_unitario`, `data_venda`)
SELECT
  'INDICE-DEMO-001',
  `ativo`.`ID`,
  `empresa`.`ID`,
  1,
  125.40,
  '2026-10-20 10:00:00'
FROM `ativos_negociaveis` AS `ativo`
INNER JOIN `empresas` AS `empresa` ON `empresa`.`nome` = 'Corretora Índice Demo'
WHERE `ativo`.`nome` = 'ETF Brasil Demo'
  AND NOT EXISTS (
    SELECT 1 FROM `vendas` WHERE `codigo_venda` = 'INDICE-DEMO-001'
  );

INSERT INTO `vendas` (`codigo_venda`, `ativo_ID`, `empresa_ID`, `quantidade`, `preco_unitario`, `data_venda`)
SELECT
  'INDICE-DEMO-002',
  `ativo`.`ID`,
  `empresa`.`ID`,
  1,
  98.75,
  '2026-10-20 11:30:00'
FROM `ativos_negociaveis` AS `ativo`
INNER JOIN `empresas` AS `empresa` ON `empresa`.`nome` = 'Corretora Índice Demo'
WHERE `ativo`.`nome` = 'Fundo Imobiliário Demo'
  AND NOT EXISTS (
    SELECT 1 FROM `vendas` WHERE `codigo_venda` = 'INDICE-DEMO-002'
  );
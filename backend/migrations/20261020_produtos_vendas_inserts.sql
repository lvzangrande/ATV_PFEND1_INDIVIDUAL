USE `quimica`;

ALTER TABLE `produtos_LIVRES`
  MODIFY `categoria` enum(
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
  ) NOT NULL;

ALTER TABLE `produtos_NAO_LIVRES`
  MODIFY `categoria` enum(
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
  ) NOT NULL;

ALTER TABLE `usuarios`
  MODIFY `senha` varchar(255) NOT NULL;

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
);

SET @adicionar_empresa_id = (
  SELECT COUNT(*) = 0
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'vendas'
    AND COLUMN_NAME = 'empresa_ID'
);
SET @sql_empresa_id = IF(
  @adicionar_empresa_id,
  'ALTER TABLE `vendas` ADD COLUMN `empresa_ID` int(11) DEFAULT NULL AFTER `produto_ID`, ADD KEY `empresa_ID` (`empresa_ID`)',
  'SELECT 1'
);
PREPARE comando_empresa_id FROM @sql_empresa_id;
EXECUTE comando_empresa_id;
DEALLOCATE PREPARE comando_empresa_id;

SET @adicionar_fk_empresa = (
  SELECT COUNT(*) = 0
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'vendas'
    AND CONSTRAINT_NAME = 'vendas_empresa_fk'
);
SET @sql_fk_empresa = IF(
  @adicionar_fk_empresa,
  'ALTER TABLE `vendas` ADD CONSTRAINT `vendas_empresa_fk` FOREIGN KEY (`empresa_ID`) REFERENCES `empresas` (`ID`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE comando_fk_empresa FROM @sql_fk_empresa;
EXECUTE comando_fk_empresa;
DEALLOCATE PREPARE comando_fk_empresa;

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

UPDATE `vendas` AS `venda`
INNER JOIN `empresas` AS `empresa` ON `empresa`.`nome` = 'Empresa de demonstração'
SET `venda`.`empresa_ID` = `empresa`.`ID`
WHERE `venda`.`codigo_venda` IN ('DEMO-20261020-001', 'DEMO-20261020-002')
  AND `venda`.`empresa_ID` IS NULL;

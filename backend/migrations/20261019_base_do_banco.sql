-- db_indice.empresas definição

CREATE TABLE `empresas` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email_rep` varchar(255) NOT NULL,
  `CNPJ` varchar(18) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `email_rep` (`email_rep`),
  UNIQUE KEY `CNPJ` (`CNPJ`)
  );


-- db_indice.ativos_negociaveis definição

CREATE TABLE `ativos_negociaveis` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum('Ações brasileiras','Ações internacionais e BDRs','Fundos imobiliários (FIIs)','Fundos de índice (ETFs)','Criptomoedas','Renda fixa','Commodities','Índices de mercado','Moedas','Fundos de investimento') NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `posicao` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`))
  ;


-- db_indice.ativos_monitorados definição

CREATE TABLE `ativos_monitorados` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum('Opções','Contratos futuros','Derivativos','Ativos em observação','Ativos internacionais','Criptoativos em observação','Renda fixa com vencimento','Fundos fechados','Índices globais','Outros instrumentos financeiros') NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `posicao` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`)
);


-- db_indice.usuarios definição

CREATE TABLE `usuarios` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(25) NOT NULL,
  `CPF` varchar(14) NOT NULL,
  `CNPJ` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `CPF` (`CPF`),
  UNIQUE KEY `CNPJ` (`CNPJ`)
);
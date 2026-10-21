-- quimica.empresas definição

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


-- quimica.produtos_LIVRES definição

CREATE TABLE `produtos_LIVRES` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum('Saneantes Domissanitários de Risco 1','Saneantes Domissanitários de Risco 2 de Venda Livre','Cosméticos, Produtos de Higiene Pessoal e Perfumaria','Tintas Imobiliárias, Vernizes e Seladoras','Adesivos e Colas de Uso Geral','Lubrificantes, Graxas e Fluidos Automotivos','Soluções Orgânicas Diluídas (até 60% de concentração)','Eletrólitos de Bateria Automotiva (até 40% de concentração)','Óleos Essenciais e Preparações Diluídas (até 4% de concentração)','Kits de Química Educacional e Didática') NOT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `estoque` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`))
  ;


-- quimica.produtos_NAO_LIVRES definição

CREATE TABLE `produtos_NAO_LIVRES` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` enum('Produtos Controlados pela Polícia Federal','Produtos Controlados pelo Exército Brasileiro','Produtos Controlados pela Polícia Civil','Saneantes e Desinfetantes de Uso Hospitalar','Saneantes Restritos ao Uso Profissional','Precursores de Entorpecentes e Psicotrópicos','Precursores de Explosivos','Armas Químicas e Insumos Relacionados','Agrotóxicos e Defensivos Agrícolas Rígidos','Substâncias Químicas Puras e Solventes Concentrados') NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `estoque` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nome` (`nome`)
);


-- quimica.usuarios definição

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
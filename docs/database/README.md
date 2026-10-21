# Banco de dados

O arquivo `estrutura.sql` contém a criação do banco `db_indice`, as tabelas usadas pelo sistema e registros fictícios para demonstração. Ele se destina a uma instalação nova; `CREATE TABLE IF NOT EXISTS` não altera tabelas que já existem.

Execute na raiz do projeto com o cliente MySQL instalado:

```bash
mysql -u SEU_USUARIO -p < docs/database/estrutura.sql
```

O comando solicitará a senha do MySQL. Depois, configure `DB_HOST`, `DB_USER`, `DB_NAME=db_indice` e, se necessário, `DB_PASS` e `DB_PORT` no `backend/.env`.

## Tabelas

- `empresas`: empresas e dados de contato, com nome, e-mail e CNPJ únicos.
- `produtos_LIVRES`: produtos que podem ser vendidos pelo fluxo atual.
- `produtos_NAO_LIVRES`: catálogo separado de produtos controlados; não são aceitos no fluxo de vendas.
- `usuarios`: usuários do sistema; `senha` comporta o hash usado pela aplicação. Não há usuário de demonstração inserido.
- `vendas`: vendas vinculadas a um produto livre e, opcionalmente, a uma empresa.

As vendas referenciam `produtos_LIVRES.ID` e `empresas.ID`. Os inserts de exemplo verificam nome ou código antes de inserir, então podem ser executados novamente sem duplicar esses registros. A empresa e os produtos de demonstração são fictícios.

Para bancos existentes, continue usando as migrations incrementais em `backend/migrations` em vez de tratar este script de instalação como atualização de esquema.
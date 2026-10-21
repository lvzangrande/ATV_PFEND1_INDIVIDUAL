# Banco de dados

O arquivo `estrutura.sql` cria o banco `db_indice`, as tabelas da carteira e registros fictícios para demonstração. Ele se destina a uma instalação nova; `CREATE TABLE IF NOT EXISTS` não altera tabelas que já existem.

Execute na raiz do projeto com o cliente MySQL instalado:

```bash
mysql -u SEU_USUARIO -p < docs/database/estrutura.sql
```

O comando solicitará a senha do MySQL. Depois, configure `DB_HOST`, `DB_USER`, `DB_NAME=db_indice` e, se necessário, `DB_PASS` e `DB_PORT` no `backend/.env`.

## Tabelas

- `empresas`: empresas e dados de contato, com nome, e-mail e CNPJ únicos.
- `ativos_negociaveis`: ativos cadastrados para negociação simulada.
- `ativos_monitorados`: ativos mantidos na carteira para acompanhamento, sem negociação neste painel.
- `usuarios`: investidores cadastrados; `senha` comporta o hash usado pela aplicação. Não há usuário de demonstração inserido.
- `vendas`: operações de venda vinculadas a um ativo negociável e, opcionalmente, a uma instituição.

As vendas referenciam `ativos_negociaveis.ID` e `empresas.ID`. Os inserts de exemplo verificam nome ou código antes de inserir, então podem ser executados novamente sem duplicar os registros. A corretora e os ativos são fictícios; os valores não representam cotações reais nem recomendação de investimento.

Para uma instalação organizada em etapas, execute `backend/migrations/20261019_base_do_banco.sql` e depois `backend/migrations/20261020_ativos_operacoes.sql`. Para bancos existentes com outro esquema, faça backup e migre os dados antes de apontar a aplicação para esta estrutura.
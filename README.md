# Índice — carteira de investimentos

## O que foi implementado

A interface Next.js consulta o MySQL por meio da API Express. Ela organiza ativos negociáveis e monitorados, registra operações simuladas, atualiza posições e administra investidores e organizações vinculadas à carteira.

Os valores e registros iniciais são fictícios: o painel não consulta cotações ao vivo, não envia ordens a corretoras e não oferece recomendações financeiras. O painel não implementa login/perfis e deve ser usado localmente, não publicado como sistema administrativo acessível pela rede.

## Banco de dados

Para criar uma base nova com todas as tabelas e dados de demonstração em um único comando, execute na raiz do projeto:

```bash
mysql -u SEU_USUARIO -p < docs/database/estrutura.sql
```

O esquema e as tabelas estão documentados em [docs/database/README.md](docs/database/README.md). Para aplicar em etapas, use as migrations abaixo.

1. Crie o banco `db_indice` e as tabelas da carteira executando `backend/migrations/20261019_base_do_banco.sql` no MySQL.
2. Copie `backend/.env.example` para `backend/.env` e preencha as credenciais do seu banco; a porta da API é configurada por `API_PORT` (padrão: `3001`).
3. Execute a migration de operações e ativos fictícios:

```bash
mysql -u SEU_USUARIO -p < backend/migrations/20261020_ativos_operacoes.sql
```

Os ativos, a corretora e as operações são fictícios, e os scripts evitam repetir registros de exemplo. Senhas existentes não são convertidas automaticamente; usuários novos e senhas redefinidas pelo painel são armazenados com bcrypt.

Para bancos com dados existentes, faça backup e adapte os dados ao novo esquema antes de executar a instalação. Não aplique o script de instalação sobre uma estrutura anterior esperando conversão automática.

## Executar a API e o Front-End

No primeiro terminal:

```bash
cd backend
npm install
npm start
```

A API conecta ao MySQL e inicia em `http://localhost:3001`. O servidor não inicia se a conexão falhar.

No segundo terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000`. O endereço padrão da API é `http://localhost:3001`; ele pode ser alterado com `NEXT_PUBLIC_API_URL` no Front-End.

## API

- `GET /api/status`, `GET /api/dashboard`
- `GET /api/ativos`, `GET /api/ativos/:status/:id`
- `POST /api/ativos`, `PUT /api/ativos/:status/:id`, `DELETE /api/ativos/:status/:id`
- `GET /api/empresas`, `POST /api/empresas`, `PUT /api/empresas/:id`, `DELETE /api/empresas/:id`
- `GET /api/usuarios`, `POST /api/usuarios`, `PUT /api/usuarios/:id`, `DELETE /api/usuarios/:id`
- `GET /api/vendas`, `POST /api/vendas`

Os cadastros validam os campos e protegem as restrições de unicidade do banco. Senhas nunca são retornadas pela API e os novos valores são armazenados com bcrypt. O registro de venda usa transação e bloqueio da linha do ativo; assim, verifica a posição e atualiza a quantidade atomicamente. Operações já registradas impedem que os ativos e organizações associados sejam apagados.

## Arquivos principais

- `backend/app.js`: rotas Express, validações e operações no MySQL.
- `backend/config/database.js`: pool de conexões MySQL.
- `frontend/src/app/page.jsx`: painel da carteira, formulários e operações.
- `frontend/src/services/api.js`: chamadas HTTP da interface.
- `backend/migrations/20261019_base_do_banco.sql`: esquema original compartilhado.
- `backend/migrations/20261020_ativos_operacoes.sql`: tabela de operações e dados iniciais.

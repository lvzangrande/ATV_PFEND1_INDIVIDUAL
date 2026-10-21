# Química Comercial — produtos e vendas

## O que foi implementado

A interface Next.js consulta o MySQL por meio da API Express. Ela lista e filtra o catálogo, cadastra, edita e exclui produtos, empresas e usuários, registra vendas de produtos livres vinculadas opcionalmente a uma empresa e atualiza o estoque. Os produtos livres e controlados são administrados nas tabelas `produtos_LIVRES` e `produtos_NAO_LIVRES`; as categorias do formulário correspondem aos enums do esquema.

O fluxo de venda registra somente produtos da tabela `produtos_LIVRES`; a API bloqueia vendas de produtos controlados. Confirme as autorizações e as regras aplicáveis antes de vender qualquer produto químico. O painel não implementa login/perfis e deve ser usado localmente, não publicado como sistema administrativo acessível pela rede.

## Banco de dados

Para criar uma base nova com todas as tabelas e dados de demonstração em um único comando, execute na raiz do projeto:

```bash
mysql -u SEU_USUARIO -p < docs/database/estrutura.sql
```

O esquema e as tabelas estão documentados em [docs/database/README.md](docs/database/README.md). Para bases existentes, siga as migrations incrementais abaixo.

1. Crie o banco `db_indice` e as tabelas originais executando o arquivo `backend/migrations/20261019_base_do_banco.sql` no seu MySQL.
2. Copie `backend/.env.example` para `backend/.env` e preencha as credenciais do seu banco; a porta da API é configurada por `API_PORT` (padrão: `3001`).
3. Execute a migração que cria a tabela de vendas e insere produtos/vendas de exemplo:

```bash
mysql -u SEU_USUARIO -p < backend/migrations/20261020_produtos_vendas_inserts.sql
```

Os produtos e as duas vendas de exemplo são genéricos; a empresa de demonstração e seu CNPJ também são fictícios. O script evita repetir os registros pelo nome/código. A migração alinha as categorias `ENUM`, cria a tabela de vendas, associa vendas opcionais a empresas e amplia `usuarios.senha` para guardar hashes. Faça backup antes de aplicá-la em uma base que já contenha produtos, pois a alteração do `ENUM` pode afetar valores legados. Senhas existentes não são convertidas automaticamente; usuários novos e senhas redefinidas pelo painel são armazenados com bcrypt.

No ambiente de desenvolvimento desta entrega, a migração foi aplicada e os `INSERT`s de exemplo foram confirmados no banco local `db_indice`.

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
- `GET /api/produtos`, `GET /api/produtos/:tipo/:id`
- `POST /api/produtos`, `PUT /api/produtos/:tipo/:id`, `DELETE /api/produtos/:tipo/:id`
- `GET /api/empresas`, `POST /api/empresas`, `PUT /api/empresas/:id`, `DELETE /api/empresas/:id`
- `GET /api/usuarios`, `POST /api/usuarios`, `PUT /api/usuarios/:id`, `DELETE /api/usuarios/:id`
- `GET /api/vendas`, `POST /api/vendas`

Os cadastros validam os campos e protegem as restrições de unicidade do banco. Senhas nunca são retornadas pela API e os novos valores são armazenados com bcrypt. O registro de venda usa transação e bloqueio da linha do produto; assim, verifica o estoque e atualiza a quantidade atomicamente. Vendas já registradas impedem que os produtos e empresas associados sejam apagados.

## Arquivos principais

- `backend/app.js`: rotas Express, validações e operações no MySQL.
- `backend/config/database.js`: pool de conexões MySQL.
- `frontend/src/app/page.jsx`: painel, catálogo, formulários e vendas.
- `frontend/src/services/api.js`: chamadas HTTP da interface.
- `backend/migrations/20261019_base_do_banco.sql`: esquema original compartilhado.
- `backend/migrations/20261020_produtos_vendas_inserts.sql`: tabela de vendas e dados iniciais.

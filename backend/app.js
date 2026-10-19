import express from 'express';
import { criarPool } from './config/database.js';
import { criarProdutoModel } from './models/ProdutoModels.js'
import { criarProdutoService } from './services/ProdutoService.js'
import { criarProdutoController } from './controllers/ProdutoController.js';
import { criarProdutoRoutes } from './routes/produtoRoutes.js';

export const app = express();
app.use(express.json());//reqs em json
// Middleware: ensina o Express a ler o corpo da requisiçãop e, JSON
// middleware programas menores destinados a desempenhar uma função específica
const pool = criarPool();
const produtoModel = criarProdutoModel({ pool });
const produtoService = criarProdutoService({ produtoModel })
const produtoController = criarProdutoController({ produtoService })
const produtoRoutes = criarProdutoRoutes({ produtoController })

app.use(express());

app.get('/api/check', (req, res) => {
    res.status(200).json({ status: 'ok', mensagem: 'Servidor funcionando via HTTP!' });
});
app.use('/api/produtos_LIVRES', produtoRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: `A rota ${req.method} ${req.originalUrl} não existe` });
})

app.use((erro, req, res, _next) => {
    console.error('Erro de Sistema: ', erro.message);
    res.status(500).json({ erro: 'Falha interna do servidor', mensagem: erro});
});
import express from 'express';

export const app = express();
app.use(express.json());
app.use(express());
app.get('api/check', (req,res)=> {
    res.status(200).json({status: 'ok', mensagem: 'Servidor funcionando via HTTP!'});
});
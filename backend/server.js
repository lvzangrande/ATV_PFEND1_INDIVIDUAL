import express from 'express';

const nomesObrigatorios = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_NAME'];

export function carregarAmbiente(arquivoDeConfiguracao){
    if(arquivoDeConfiguracao){
        try{
            process.loadEnvFile(arquivoDeConfiguracao);
        } catch {
            throw new Error(`Arqivo de config não encontrado: ${arquivoDeConfiguracao}`);
        }
    }
}


const config = carregarAmbiente('.env');
const { app } = express();
const porta = config.porta || 3000;
app.listen(porta,()=>{
    console.log(`Server rodando em http://localhost:${porta}`)
});
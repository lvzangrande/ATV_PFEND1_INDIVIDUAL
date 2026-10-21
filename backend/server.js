import { app } from './app.js';
import { pool } from './config/database.js';

const porta = Number(process.env.API_PORT) || 3001;

try {
  await pool.query('SELECT 1');
  app.listen(porta, () => {
    console.log(`API de produtos disponível em http://localhost:${porta}`);
  });
} catch (erro) {
  console.error('Não foi possível conectar ao MySQL. Confira o backend/.env e inicie novamente.');
  console.error(`Código do erro: ${erro.code || 'desconhecido'}`);
  process.exitCode = 1;
  await pool.end();
}

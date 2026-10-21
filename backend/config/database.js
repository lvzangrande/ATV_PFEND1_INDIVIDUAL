import 'dotenv/config';
import mysql from 'mysql2/promise';

const obrigatorias = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const ausentes = obrigatorias.filter((campo) => !process.env[campo]?.trim());

if (ausentes.length > 0) {
  throw new Error(`Configure as variáveis do MySQL no arquivo backend/.env: ${ausentes.join(', ')}.`);
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

export function criarPool() {
  return pool;
}

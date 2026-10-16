import mysql from 'mysql2/promise';
import 'dotenv/config'

export function criarPool(){
    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit:10,
        queueLimit:0
    })
}
const pool = criarPool();

try {
    await pool.query('SELECT 1');
    console.log('Conexão MySQL OK');
} catch (erro) {
    console.error('Código:', erro.code);
    console.error('Mensagem:', erro.message);
}
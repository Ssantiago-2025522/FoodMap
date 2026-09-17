import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection()
  .then((connection) => {
    console.log('Conexión a MySQL establecida');
    connection.release();
  })
  .catch((err) => {
    console.error('Error al conectar a MySQL:', err.message);
  });

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'foodmapdb_in5bm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  typeCast(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      const valor = field.string();
      return valor === null ? null : valor === '1';
    }
    return next();
  },
});

async function verificarConexion() {
  const conexion = await pool.getConnection();
  try {
    await conexion.query('SELECT 1');
  } finally {
    conexion.release();
  }
}

async function conTransaccion(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  pool,
  verificarConexion,
  conTransaccion,
};
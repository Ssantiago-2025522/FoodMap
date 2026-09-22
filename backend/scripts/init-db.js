const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const RUTA_SQL = path.join(__dirname, '..', '..', 'database', 'foodmapdb_in5bm.sql');
const NOMBRE_BASE_SCRIPT = 'foodmapdb_in5bm';
const nombreBase = process.env.DB_NAME || NOMBRE_BASE_SCRIPT;
const forzar = process.argv.includes('--force');

async function inicializar() {
  if (!/^[A-Za-z0-9_]+$/.test(nombreBase)) {
    throw new Error(`DB_NAME "${nombreBase}" no es válido (solo letras, números y guion bajo).`);
  }

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const [existentes] = await conexion.query(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [nombreBase]
    );

    if (existentes.length > 0 && !forzar) {
      console.log(`La base de datos "${nombreBase}" ya existe. No se modificó nada.`);
      console.log('Para recrearla desde cero (borra sus datos): npm run db:init -- --force');
      return;
    }

    const sql = fs.readFileSync(RUTA_SQL, 'utf8').split(NOMBRE_BASE_SCRIPT).join(nombreBase);
    await conexion.query(sql);
    console.log(`Base de datos "${nombreBase}" creada con sus tablas y roles.`);
  } finally {
    await conexion.end();
  }
}

inicializar().catch((error) => {
  console.error('No se pudo inicializar la base de datos:', error.message);
  process.exit(1);
});

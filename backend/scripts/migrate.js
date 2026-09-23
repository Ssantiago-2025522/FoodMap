/**
 * Control de migraciones de base de datos para FoodMap.
 *
 * Aplica, en orden, los archivos .sql de `database/migrations/` que todavía
 * no se hayan ejecutado en esta base de datos, y registra cada uno en la
 * tabla `schema_migrations` para no volver a aplicarlo. Así se evita
 * depender de ejecutar archivos .sql sueltos "a mano" y de recordar cuáles
 * ya se aplicaron.
 *
 * Uso:
 *   npm run db:migrate            Aplica las migraciones pendientes
 *   npm run db:migrate -- --list  Solo muestra el estado (sin aplicar nada)
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DIRECTORIO_MIGRACIONES = path.join(__dirname, '..', 'database', 'migrations');
const soloListar = process.argv.includes('--list');

function obtenerArchivosMigracion() {
  if (!fs.existsSync(DIRECTORIO_MIGRACIONES)) return [];

  return fs
    .readdirSync(DIRECTORIO_MIGRACIONES)
    .filter((nombre) => nombre.endsWith('.sql'))
    .sort(); // los prefijos numéricos (0001_, 0002_, ...) definen el orden
}

async function asegurarTablaControl(conexion) {
  await conexion.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      nombre_archivo VARCHAR(255) NOT NULL UNIQUE,
      aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function obtenerAplicadas(conexion) {
  const [filas] = await conexion.query('SELECT nombre_archivo FROM schema_migrations');
  return new Set(filas.map((fila) => fila.nombre_archivo));
}

async function migrar() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    await asegurarTablaControl(conexion);

    const archivos = obtenerArchivosMigracion();
    const aplicadas = await obtenerAplicadas(conexion);
    const pendientes = archivos.filter((archivo) => !aplicadas.has(archivo));

    if (soloListar) {
      console.log('Migraciones aplicadas:');
      archivos
        .filter((archivo) => aplicadas.has(archivo))
        .forEach((archivo) => console.log(`  [x] ${archivo}`));
      console.log('Migraciones pendientes:');
      pendientes.forEach((archivo) => console.log(`  [ ] ${archivo}`));
      if (archivos.length === 0) console.log('  (no hay archivos de migración)');
      return;
    }

    if (pendientes.length === 0) {
      console.log('No hay migraciones pendientes. La base de datos ya está actualizada.');
      return;
    }

    for (const archivo of pendientes) {
      const rutaCompleta = path.join(DIRECTORIO_MIGRACIONES, archivo);
      const sql = fs.readFileSync(rutaCompleta, 'utf8');

      console.log(`Aplicando ${archivo}...`);
      await conexion.query(sql);
      await conexion.query('INSERT INTO schema_migrations (nombre_archivo) VALUES (?)', [archivo]);
      console.log(`  OK`);
    }

    console.log(`Listo: se aplicaron ${pendientes.length} migración(es).`);
  } finally {
    await conexion.end();
  }
}

migrar().catch((error) => {
  console.error('No se pudieron aplicar las migraciones:', error.message);
  process.exit(1);
});

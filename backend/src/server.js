const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const { verificarConexion } = require('./config/db');

const PORT = process.env.PORT || 8080;

async function iniciar() {
  try {
    await verificarConexion();
    console.log('Conexión a la base de datos establecida.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('La base de datos no existe. Créala con: npm run db:init');
    } else {
      console.error('Revisa DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en .env');
    }
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`FoodMap backend escuchando en http://localhost:${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}/api`);
  });
}

iniciar();

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import { manejarErrores } from './middlewares/errores.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';
import chatsRoutes from './routes/chats.routes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));

app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/chats', chatsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use(manejarErrores);

const puerto = Number(process.env.PORT ?? 3000);

try {
  await pool.query('SELECT 1');
  console.log('Conectado a MySQL');
} catch (error) {
  console.error('No se pudo conectar a MySQL. Revisa tu archivo .env:', error.message);
  process.exit(1);
}

app.listen(puerto, () => console.log(`API lista en http://localhost:${puerto}`));

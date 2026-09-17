import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db';

import solicitudesRoutes from './routes/solicitudes.routes';
import notificacionesRoutes from './routes/notificaciones.routes';
import donacionesRoutes from './routes/donaciones.routes';
import historialRoutes from './routes/historial.routes';
import chatRoutes from './routes/chat.routes';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/donaciones', donacionesRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/chats', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀 FoodMap backend corriendo en http://localhost:${PORT}`);
});

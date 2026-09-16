import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db';

import solicitudesRoutes from './routes/solicitudes.routes';
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/solicitudes', solicitudesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀 FoodMap backend corriendo en http://localhost:${PORT}`);
});

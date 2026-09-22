const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const { noEncontrado, errorHandler } = require('./middlewares/errorHandler');

const app = express();

const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((origen) => origen.trim());

app.use(
  cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Se aumenta el límite por defecto (100kb) porque la foto de perfil se envía
// como una imagen en base64 dentro del cuerpo JSON.
app.use(express.json({ limit: '3mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.use(noEncontrado);
app.use(errorHandler);

module.exports = app;

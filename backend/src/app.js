const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const chatsRoutes = require('./routes/chats.routes');
const calificacionesRoutes = require('./routes/calificaciones.routes');
const { noEncontrado, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.set('etag', false);

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

// Aumentamos el límite del cuerpo de las peticiones a 50MB para soportar imágenes en Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

app.use(noEncontrado);
app.use(errorHandler);

module.exports = app;
const { Router } = require('express');
const { requiereAutenticacion } = require('../middlewares/auth.middleware');
const c = require('../controllers/solicitudes.controller');

const router = Router();
router.use(requiereAutenticacion);

router.get('/donaciones-disponibles', c.donacionesDisponibles);
router.get('/historial', c.historial);
router.post('/validar-qr', c.validarQr);

router.get('/', c.listar);
router.post('/', c.crear);
router.get('/:id', c.obtener);
router.get('/:id/qr', c.obtenerQr);
router.patch('/:id/aceptar', c.aceptar);
router.patch('/:id/rechazar', c.rechazar);
router.patch('/:id/confirmar-recepcion', c.confirmarRecepcion);

module.exports = router;

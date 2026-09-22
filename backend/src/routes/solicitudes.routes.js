import { Router } from 'express';
import { usuarioActual } from '../middlewares/usuario.js';
import { asyncHandler as ah } from '../utils/async-handler.js';
import * as c from '../controllers/solicitudes.controller.js';

const router = Router();
router.use(usuarioActual);

router.get('/donaciones-disponibles', ah(c.donacionesDisponibles));
router.get('/historial', ah(c.historial));

router.get('/', ah(c.listar));
router.post('/', ah(c.crear));
router.get('/:id', ah(c.obtener));
router.patch('/:id/aceptar', ah(c.aceptar));
router.patch('/:id/rechazar', ah(c.rechazar));
router.patch('/:id/confirmar-recepcion', ah(c.confirmarRecepcion));

export default router;

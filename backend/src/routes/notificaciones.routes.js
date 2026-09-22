import { Router } from 'express';
import { usuarioActual } from '../middlewares/usuario.js';
import { asyncHandler as ah } from '../utils/async-handler.js';
import * as c from '../controllers/notificaciones.controller.js';

const router = Router();
router.use(usuarioActual);

router.get('/', ah(c.listar));
router.post('/cercanos', ah(c.generarCercanas));
router.patch('/leidas', ah(c.marcarTodasLeidas));
router.patch('/:id/leida', ah(c.marcarLeida));

export default router;

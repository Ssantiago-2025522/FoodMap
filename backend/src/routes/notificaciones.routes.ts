import { Router } from 'express';
import * as notificacionesController from '../controllers/notificaciones.controller';

const router = Router();

router.get('/', notificacionesController.listar);
router.patch('/:id/leida', notificacionesController.marcarLeida);

export default router;

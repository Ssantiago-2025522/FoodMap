import { Router } from 'express';
import * as solicitudesController from '../controllers/solicitudes.controller';
import * as entregasController from '../controllers/entregas.controller';

const router = Router();

router.post('/', solicitudesController.crear);
router.get('/', solicitudesController.listar);
router.get('/:id', solicitudesController.obtenerUno);
router.patch('/:id/aceptar', solicitudesController.aceptar);
router.patch('/:id/rechazar', solicitudesController.rechazar);
router.patch('/:id/confirmar-recepcion', entregasController.confirmar);

export default router;

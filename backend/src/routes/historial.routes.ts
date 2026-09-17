import { Router } from 'express';
import * as historialController from '../controllers/historial.controller';

const router = Router();

router.get('/', historialController.listar);

export default router;

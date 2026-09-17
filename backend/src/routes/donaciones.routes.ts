import { Router } from 'express';
import * as donacionesController from '../controllers/donaciones.controller';

const router = Router();

router.post('/', donacionesController.crear);

export default router;

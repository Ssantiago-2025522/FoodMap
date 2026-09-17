import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.get('/', chatController.listar);
router.get('/:id', chatController.obtenerUno);
router.post('/:id/mensajes', chatController.enviarMensaje);

export default router;

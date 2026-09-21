import { Router } from 'express';
import { usuarioActual } from '../middlewares/usuario.js';
import { asyncHandler as ah } from '../utils/async-handler.js';
import * as c from '../controllers/chats.controller.js';

const router = Router();
router.use(usuarioActual);

router.get('/', ah(c.listar));
router.get('/:id', ah(c.obtener));
router.post('/:id/mensajes', ah(c.enviarMensaje));

export default router;

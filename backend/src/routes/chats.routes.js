const { Router } = require('express');
const { usuarioActual } = require('../middlewares/usuario');
const { asyncHandler: ah } = require('../utils/async-handler');
const {
  listar,
  obtener,
  enviarMensaje
} = require('../controllers/chats.controller');

const router = Router();

router.use(usuarioActual);

router.get('/', ah(listar));
router.get('/:id', ah(obtener));
router.post('/:id/mensajes', ah(enviarMensaje));

module.exports = router;
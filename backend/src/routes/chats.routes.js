const { Router } = require('express');
<<<<<<< HEAD
const { usuarioActual } = require('../middlewares/usuario');
const { asyncHandler: ah } = require('../utils/async-handler');
const {
  listar,
  obtener,
  enviarMensaje
} = require('../controllers/chats.controller');

const router = Router();

router.use(usuarioActual);
=======
const { requiereAutenticacion } = require('../middlewares/auth.middleware.js');
const { asyncHandler: ah } = require('../utils/async-handler.js');
const c = require('../controllers/chats.controller.js');

const router = Router();
router.use(requiereAutenticacion);
>>>>>>> origin/developer

router.get('/', ah(listar));
router.get('/:id', ah(obtener));
router.post('/:id/mensajes', ah(enviarMensaje));

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> origin/developer

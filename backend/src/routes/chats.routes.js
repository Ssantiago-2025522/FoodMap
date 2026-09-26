const { Router } = require('express');
const { requiereAutenticacion } = require('../middlewares/auth.middleware.js');
const { asyncHandler: ah } = require('../utils/async-handler.js');
const c = require('../controllers/chats.controller.js');

const router = Router();

router.use(requiereAutenticacion);

router.get('/', ah(c.listar));
router.get('/:id', ah(c.obtener));
router.post('/:id/mensajes', ah(c.enviarMensaje));

module.exports = router;
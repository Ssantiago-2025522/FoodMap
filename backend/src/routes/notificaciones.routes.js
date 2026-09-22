const { Router } = require('express');
const { usuarioActual } = require('../middlewares/usuario.js');
const { asyncHandler: ah } = require('../utils/async-handler.js');
const c = require('../controllers/notificaciones.controller.js');

const router = Router();
router.use(usuarioActual);

router.get('/', ah(c.listar));
router.post('/cercanos', ah(c.generarCercanas));
router.patch('/leidas', ah(c.marcarTodasLeidas));
router.patch('/:id/leida', ah(c.marcarLeida));

module.exports = router;
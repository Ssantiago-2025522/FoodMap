const { Router } = require('express');
const { requiereAutenticacion } = require('../middlewares/auth.middleware.js');
const { asyncHandler: ah } = require('../utils/async-handler.js');
const c = require('../controllers/notificaciones.controller.js');

const router = Router();
router.use(requiereAutenticacion);

router.get('/', ah(c.listar));
router.post('/cercanos', ah(c.generarCercanas));
router.patch('/leidas', ah(c.marcarTodasLeidas));
router.patch('/:id/leida', ah(c.marcarLeida));

module.exports = router;
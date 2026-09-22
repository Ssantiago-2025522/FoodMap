const { Router } = require('express');
const { listar, obtenerPorId, crear, actualizar, ocultarPublicaciones, eliminar } = require('../controllers/usuarioController');
const { requiereAutenticacion, requiereRol } = require('../middlewares/auth.middleware');

const ROL_ADMIN = 1;

const router = Router();

router.use(requiereAutenticacion, requiereRol(ROL_ADMIN));

router.get('/', listar);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.put('/:id', actualizar);
router.patch('/:id/ocultar-publicaciones', ocultarPublicaciones);
router.delete('/:id', eliminar);

module.exports = router;
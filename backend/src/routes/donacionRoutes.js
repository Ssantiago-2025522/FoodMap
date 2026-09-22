const { Router } = require('express');
const {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarVisibilidad,
  eliminar
} = require('../controllers/donacionController');
const { requiereAutenticacion, requiereRol } = require('../middlewares/auth.middleware');

const ROL_ADMIN = 1;

const router = Router();

router.use(requiereAutenticacion);

router.get('/', listar);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.put('/:id', actualizar);
router.patch('/:id/visibilidad', requiereRol(ROL_ADMIN), cambiarVisibilidad);
router.delete('/:id', eliminar);

module.exports = router;
const { Router } = require('express');
const { listar, obtenerPorId, crear, actualizar, eliminar } = require('../controllers/donacionController');
const { requiereAutenticacion } = require('../middlewares/auth.middleware');

const router = Router();

router.use(requiereAutenticacion);

router.get('/', listar);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;

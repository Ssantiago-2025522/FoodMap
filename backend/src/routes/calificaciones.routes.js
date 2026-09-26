const { Router } = require('express');
const { requiereAutenticacion } = require('../middlewares/auth.middleware');
const c = require('../controllers/calificaciones.controller');

const router = Router();

router.use(requiereAutenticacion);

router.post('/', c.crear);
router.get('/entrega/:idEntrega', c.listarPorEntrega);

module.exports = router;
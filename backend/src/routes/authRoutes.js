const { Router } = require('express');
const {
  register,
  login,
  perfil,
  actualizarPerfil,
  cambiarContrasena,
  solicitarRecuperacion,
  restablecerContrasena
} = require('../controllers/authController');
const { requiereAutenticacion } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.post('/olvide-contrasena', solicitarRecuperacion);
router.post('/restablecer-contrasena', restablecerContrasena);

router.get('/perfil', requiereAutenticacion, perfil);
router.put('/perfil', requiereAutenticacion, actualizarPerfil);
router.put('/contrasena', requiereAutenticacion, cambiarContrasena);

module.exports = router;

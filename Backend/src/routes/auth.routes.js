const express = require('express');
const router = express.Router();
const { login, registrar, cambiarPassword, miPerfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/registro', registrar);
router.get('/me', verificarToken, miPerfil);
router.post('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { login, cambiarPassword } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;
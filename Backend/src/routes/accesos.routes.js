const express = require('express');
const router = express.Router();
const { registrarAcceso, vehiculosDentro, miHistorial } = require('../controllers/accesos.controller');
const { verificarToken, soloSuperadmin } = require('../middlewares/auth.middleware');

router.post('/registrar', verificarToken, registrarAcceso);
router.get('/dentro-ahora', verificarToken, soloSuperadmin, vehiculosDentro);
router.get('/historial', verificarToken, miHistorial);

module.exports = router;
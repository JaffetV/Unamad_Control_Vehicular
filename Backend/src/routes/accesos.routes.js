const express = require('express');
const router = express.Router();
const { registrarAcceso, vehiculosDentro, miHistorial } = require('../controllers/accesos.controller');
const { verificarToken, soloRoles } = require('../middlewares/auth.middleware');

router.post('/registrar', verificarToken, soloRoles('operador', 'superadmin'), registrarAcceso);
router.get('/dentro-ahora', verificarToken, soloRoles('operador', 'superadmin'), vehiculosDentro);
router.get('/historial', verificarToken, miHistorial);

module.exports = router;

const express = require('express');
const router = express.Router();
const { listarVehiculos, registrarVehiculo } = require('../controllers/vehiculos.controller');
const { verificarToken, soloRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, listarVehiculos);
router.post('/', verificarToken, soloRoles('estudiante', 'superadmin'), registrarVehiculo);

module.exports = router;

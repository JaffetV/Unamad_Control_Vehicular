const express = require('express');
const router = express.Router();
const { listarVehiculos, registrarVehiculo } = require('../controllers/vehiculos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, listarVehiculos);
router.post('/', verificarToken, registrarVehiculo);

module.exports = router;
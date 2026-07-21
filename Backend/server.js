require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const vehiculosRoutes = require('./src/routes/vehiculos.routes');
const accesosRoutes = require('./src/routes/accesos.routes');

const app = express();

// --- Seguridad básica ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// Limita intentos de login para frenar fuerza bruta / bots
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Demasiados intentos, intenta más tarde' },
});
app.use('/api/auth/login', limiteLogin);

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/accesos', accesosRoutes);

app.get('/', (req, res) => res.json({ estado: 'ok', servicio: 'UNAMAD Control Vehicular API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚗 Servidor corriendo en http://localhost:${PORT}`));
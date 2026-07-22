require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const vehiculosRoutes = require('./src/routes/vehiculos.routes');
const accesosRoutes = require('./src/routes/accesos.routes');

const app = express();
const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

// --- Seguridad básica ---
app.use(helmet());
app.use(cors({
  origin(origen, callback) {
    if (!origen || origenesPermitidos.includes(origen)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));

// Limita intentos de login para frenar fuerza bruta / bots
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Demasiados intentos, intenta más tarde' },
});
app.use('/api/auth/login', limiteLogin);
app.use('/api/auth/registro', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }));

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/accesos', accesosRoutes);

app.get('/', (req, res) => res.json({ estado: 'ok', servicio: 'UNAMAD Control Vehicular API' }));

app.use((error, req, res, next) => {
  if (error.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: 'Origen no autorizado' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Ocurrió un error inesperado' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚗 Servidor corriendo en http://localhost:${PORT}`));

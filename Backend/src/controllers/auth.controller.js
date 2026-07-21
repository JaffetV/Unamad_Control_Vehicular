const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const MAX_INTENTOS = 5;

async function login(req, res) {
  const { codigo_universitario, password } = req.body;

  if (!codigo_universitario || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE codigo_universitario = $1 AND activo = TRUE`,
      [codigo_universitario]
    );
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return res.status(423).json({ error: 'Cuenta bloqueada temporalmente, intenta más tarde' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      const intentos = usuario.intentos_fallidos + 1;
      const bloqueado = intentos >= MAX_INTENTOS;

      await pool.query(
        `UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = $2 WHERE codigo_universitario = $3`,
        [intentos, bloqueado ? new Date(Date.now() + 15 * 60 * 1000) : null, codigo_universitario]
      );

      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    await pool.query(
      `UPDATE usuarios SET intentos_fallidos = 0, ultimo_login = now() WHERE codigo_universitario = $1`,
      [codigo_universitario]
    );

    const token = jwt.sign(
      { codigo_universitario: usuario.codigo_universitario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      debe_cambiar_password: usuario.debe_cambiar_password,
      usuario: {
        codigo_universitario: usuario.codigo_universitario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function cambiarPassword(req, res) {
  const { password_actual, password_nueva } = req.body;
  const { codigo_universitario } = req.usuario;

  if (!password_actual || !password_nueva) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  if (password_nueva.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT password_hash FROM usuarios WHERE codigo_universitario = $1`,
      [codigo_universitario]
    );
    const usuario = rows[0];
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password_actual, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const nuevoHash = await bcrypt.hash(password_nueva, 10);
    await pool.query(
      `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = FALSE WHERE codigo_universitario = $2`,
      [nuevoHash, codigo_universitario]
    );

    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ESTA LÍNEA ES LA MÁS IMPORTANTE PARA QUE NO DE ERROR
module.exports = { login, cambiarPassword };
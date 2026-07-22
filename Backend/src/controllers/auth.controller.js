const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const MAX_INTENTOS = 5;
const HASH_NEUTRO = '$2b$10$fxihgzQd6YEQy8DZM5LKWOzV3cMfrOaPyihQSpWvMiFREmKCg5U2e';
const PASSWORD_FUERTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

function passwordEsFuerte(password) {
  return typeof password === 'string' && PASSWORD_FUERTE.test(password);
}

function datosPublicos(usuario) {
  return {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo_institucional: usuario.correo_institucional,
    matricula_academica: usuario.matricula_academica,
    carrera_id: usuario.carrera_id,
    rol: usuario.rol,
  };
}

function crearToken(usuario) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET no está configurado de forma segura');
  }

  return jwt.sign(
    { id: usuario.id, matricula_academica: usuario.matricula_academica, rol: usuario.rol },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

function separarNombreCompleto(nombreCompleto) {
  const partes = String(nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return null;
  return { nombres: partes.slice(0, -1).join(' '), apellidos: partes.at(-1) };
}

async function buscarCarrera(client, carreraId, carreraNombre) {
  if (Number.isInteger(Number(carreraId))) {
    const resultado = await client.query('SELECT id FROM escuelas_profesionales WHERE id = $1', [Number(carreraId)]);
    return resultado.rows[0]?.id;
  }

  if (typeof carreraNombre === 'string' && carreraNombre.trim()) {
    const resultado = await client.query(
      'SELECT id FROM escuelas_profesionales WHERE lower(nombre_escuela) = lower($1)',
      [carreraNombre.trim()]
    );
    return resultado.rows[0]?.id;
  }

  return undefined;
}

async function login(req, res) {
  const identificador = String(req.body.identificador || req.body.correo_institucional || req.body.matricula_academica || '').trim();
  const { password } = req.body;

  if (!identificador || !password) return res.status(400).json({ error: 'Ingresa tus credenciales' });

  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios
       WHERE (correo_institucional = $1 OR matricula_academica = $1) AND estado = 'activo'
       LIMIT 1`,
      [identificador]
    );
    const usuario = rows[0];

    if (!usuario) {
      await bcrypt.compare(password, HASH_NEUTRO);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return res.status(423).json({ error: 'La cuenta está bloqueada temporalmente' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      const intentos = usuario.intentos_fallidos + 1;
      await pool.query(
        `UPDATE usuarios
         SET intentos_fallidos = $1,
             bloqueado_hasta = CASE WHEN $1 >= $2 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END
         WHERE id = $3`,
        [intentos, MAX_INTENTOS, usuario.id]
      );
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await pool.query(
      'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW() WHERE id = $1',
      [usuario.id]
    );

    return res.json({
      token: crearToken(usuario),
      debe_cambiar_password: usuario.debe_cambiar_password,
      usuario: datosPublicos(usuario),
    });
  } catch (error) {
    console.error('Error de inicio de sesión:', error.message);
    return res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
}

async function registrar(req, res) {
  const nombre = separarNombreCompleto(req.body.nombre_completo || req.body.nombreCompleto);
  const correo = String(req.body.correo_institucional || req.body.correo || '').trim().toLowerCase();
  const matricula = String(req.body.matricula_academica || req.body.matriculaAcademica || '').trim();
  const placa = String(req.body.placa || '').trim().toUpperCase();
  const { password } = req.body;

  if (!nombre || !correo || !matricula || !placa || !password) {
    return res.status(400).json({ error: 'Completa todos los campos obligatorios' });
  }
  if (!correo.endsWith('@unamad.edu.pe')) {
    return res.status(400).json({ error: 'Usa tu correo institucional UNAMAD' });
  }
  if (!passwordEsFuerte(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener 12 caracteres, mayúscula, minúscula y número' });
  }
  if (!/^[A-Z0-9]{2,4}-?[A-Z0-9]{2,4}$/.test(placa)) {
    return res.status(400).json({ error: 'El formato de la placa no es válido' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const carreraId = await buscarCarrera(client, req.body.carrera_id, req.body.carrera);
    if (!carreraId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Selecciona una carrera válida' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await client.query(
      `INSERT INTO usuarios (nombres, apellidos, correo_institucional, matricula_academica, carrera_id, password_hash, debe_cambiar_password)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE)
       RETURNING *`,
      [nombre.nombres, nombre.apellidos, correo, matricula, carreraId, passwordHash]
    );
    await client.query(
      `INSERT INTO vehiculos (placa, propietario_matricula, marca, modelo, color, tipo)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::tipo_vehiculo, 'auto'))`,
      [placa, matricula, req.body.marca || null, req.body.modelo || null, req.body.color || null, req.body.tipo || null]
    );
    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, detalles)
       VALUES ($1, 'REGISTRO_ESTUDIANTE', $2::jsonb)`,
      [usuario.rows[0].id, JSON.stringify({ placa })]
    );
    await client.query('COMMIT');
    return res.status(201).json({ token: crearToken(usuario.rows[0]), usuario: datosPublicos(usuario.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ error: 'El correo, código o placa ya está registrado' });
    if (error.code === '22P02' || error.code === '23514') return res.status(400).json({ error: 'Los datos enviados no son válidos' });
    console.error('Error de registro:', error.message);
    return res.status(500).json({ error: 'No se pudo crear la cuenta' });
  } finally {
    client.release();
  }
}

async function cambiarPassword(req, res) {
  const { password_actual: passwordActual, password_nueva: passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva) return res.status(400).json({ error: 'Faltan datos' });
  if (!passwordEsFuerte(passwordNueva)) {
    return res.status(400).json({ error: 'La contraseña debe tener 12 caracteres, mayúscula, minúscula y número' });
  }

  try {
    const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.usuario.id]);
    if (!rows[0] || !(await bcrypt.compare(passwordActual, rows[0].password_hash))) {
      return res.status(401).json({ error: 'La contraseña actual no es válida' });
    }
    const hash = await bcrypt.hash(passwordNueva, 12);
    await pool.query(
      `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = FALSE WHERE id = $2`,
      [hash, req.usuario.id]
    );
    await pool.query(
      `INSERT INTO auditoria (usuario_id, accion) VALUES ($1, 'CAMBIO_PASSWORD')`,
      [req.usuario.id]
    );
    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  }
}

async function miPerfil(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombres, u.apellidos, u.correo_institucional, u.matricula_academica, u.rol,
              e.nombre_escuela AS carrera
       FROM usuarios u LEFT JOIN escuelas_profesionales e ON e.id = u.carrera_id
       WHERE u.id = $1`,
      [req.usuario.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error de perfil:', error.message);
    return res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
}

module.exports = { login, registrar, cambiarPassword, miPerfil };

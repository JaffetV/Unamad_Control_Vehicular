const pool = require('../config/database');

const TIPOS_VALIDOS = new Set(['auto', 'moto', 'camioneta', 'bicicleta', 'otro']);
const PLACA_VALIDA = /^[A-Z0-9]{2,4}-?[A-Z0-9]{2,4}$/;

async function listarVehiculos(req, res) {
  try {
    let query;
    let params;
    if (req.usuario.rol === 'superadmin') {
      query = `SELECT v.*, u.nombres, u.apellidos, u.correo_institucional
               FROM vehiculos v JOIN usuarios u ON u.matricula_academica = v.propietario_matricula
               ORDER BY v.creado_en DESC`;
      params = [];
    } else if (req.usuario.rol === 'operador') {
      query = `SELECT placa, marca, modelo, color, tipo, estado
               FROM vehiculos WHERE estado = 'activo' ORDER BY placa`;
      params = [];
    } else {
      query = `SELECT * FROM vehiculos WHERE propietario_matricula = $1 ORDER BY creado_en DESC`;
      params = [req.usuario.matricula_academica];
    }
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Error al listar vehículos:', error.message);
    return res.status(500).json({ error: 'No se pudieron obtener los vehículos' });
  }
}

async function registrarVehiculo(req, res) {
  const placa = String(req.body.placa || '').trim().toUpperCase();
  const tipo = req.body.tipo || 'auto';
  const propietario = req.usuario.rol === 'superadmin'
    ? String(req.body.propietario_matricula || req.usuario.matricula_academica).trim()
    : req.usuario.matricula_academica;

  if (!PLACA_VALIDA.test(placa)) return res.status(400).json({ error: 'El formato de la placa no es válido' });
  if (!TIPOS_VALIDOS.has(tipo)) return res.status(400).json({ error: 'El tipo de vehículo no es válido' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO vehiculos (placa, propietario_matricula, marca, modelo, color, tipo)
       VALUES ($1, $2, $3, $4, $5, $6::tipo_vehiculo)
       RETURNING *`,
      [placa, propietario, req.body.marca || null, req.body.modelo || null, req.body.color || null, tipo]
    );
    await pool.query(
      `INSERT INTO auditoria (usuario_id, accion, detalles) VALUES ($1, 'REGISTRO_VEHICULO', $2::jsonb)`,
      [req.usuario.id, JSON.stringify({ placa, propietario_matricula: propietario })]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Esa placa ya está registrada' });
    if (error.code === '23503') return res.status(404).json({ error: 'El propietario no existe' });
    console.error('Error al registrar vehículo:', error.message);
    return res.status(500).json({ error: 'No se pudo registrar el vehículo' });
  }
}

module.exports = { listarVehiculos, registrarVehiculo };

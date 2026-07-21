const pool = require('../config/database');

async function listarVehiculos(req, res) {
  try {
    const { rol, codigo_universitario } = req.usuario;

    const query =
      rol === 'superadmin'
        ? `SELECT v.*, u.nombres, u.apellidos
           FROM vehiculos v
           JOIN usuarios u ON u.codigo_universitario = v.codigo_universitario
           WHERE v.activo = TRUE
           ORDER BY v.creado_en DESC`
        : `SELECT * FROM vehiculos WHERE codigo_universitario = $1 AND activo = TRUE`;

    const params = rol === 'superadmin' ? [] : [codigo_universitario];
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function registrarVehiculo(req, res) {
  try {
    const { codigo_universitario } = req.usuario;
    const { matricula, marca, modelo, color, tipo_vehiculo } = req.body;

    if (!matricula) {
      return res.status(400).json({ error: 'La matrícula es obligatoria' });
    }

    const { rows } = await pool.query(
      `INSERT INTO vehiculos (matricula, codigo_universitario, marca, modelo, color, tipo_vehiculo)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'auto'))
       RETURNING *`,
      [matricula.toUpperCase(), codigo_universitario, marca, modelo, color, tipo_vehiculo]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Esa matrícula ya está registrada' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Formato de matrícula inválido' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarVehiculos, registrarVehiculo };
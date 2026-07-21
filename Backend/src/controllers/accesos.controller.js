const pool = require('../config/database');

async function registrarAcceso(req, res) {
  try {
    const { rol, codigo_universitario } = req.usuario;
    const { matricula } = req.body;

    if (!matricula) {
      return res.status(400).json({ error: 'La matrícula es obligatoria' });
    }

    if (rol !== 'superadmin') {
      const { rows: propio } = await pool.query(
        `SELECT 1 FROM vehiculos WHERE matricula = $1 AND codigo_universitario = $2 AND activo = TRUE`,
        [matricula.toUpperCase(), codigo_universitario]
      );
      if (propio.length === 0) {
        return res.status(403).json({ error: 'No puedes registrar accesos de un vehículo que no es tuyo' });
      }
    }

    const metodo = rol === 'superadmin' ? 'OCR_CAMARA' : 'APP_MOVIL';

    const { rows } = await pool.query(
      `SELECT registrar_acceso($1, $2, $3) AS resultado`,
      [matricula.toUpperCase(), codigo_universitario, metodo]
    );

    return res.json({ resultado: rows[0].resultado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function vehiculosDentro(req, res) {
  try {
    const { rows } = await pool.query(`SELECT * FROM vista_vehiculos_dentro ORDER BY fecha_hora_entrada DESC`);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function miHistorial(req, res) {
  try {
    const { rol, codigo_universitario } = req.usuario;

    const query =
      rol === 'superadmin'
        ? `SELECT h.*, v.matricula FROM historial_accesos h
           JOIN vehiculos v ON v.matricula = h.matricula
           ORDER BY h.fecha_hora_entrada DESC LIMIT 200`
        : `SELECT h.* FROM historial_accesos h
           JOIN vehiculos v ON v.matricula = h.matricula
           WHERE v.codigo_universitario = $1
           ORDER BY h.fecha_hora_entrada DESC`;

    const params = rol === 'superadmin' ? [] : [codigo_universitario];
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { registrarAcceso, vehiculosDentro, miHistorial };
const pool = require('../config/database');

const METODOS_VALIDOS = new Set(['manual_web', 'manual_movil', 'ocr_camara', 'codigo_qr']);
const PLACA_VALIDA = /^[A-Z0-9]{2,4}-?[A-Z0-9]{2,4}$/;

async function registrarAcceso(req, res) {
  const placa = String(req.body.placa || '').trim().toUpperCase();
  const puerta = String(req.body.puerta || '').trim();
  const metodo = req.body.metodo_registro || 'manual_web';

  if (!PLACA_VALIDA.test(placa) || !puerta || puerta.length > 80 || !METODOS_VALIDOS.has(metodo)) {
    return res.status(400).json({ error: 'Los datos del acceso no son válidos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const vehiculo = await client.query(
      `SELECT placa FROM vehiculos WHERE placa = $1 AND estado = 'activo' FOR SHARE`,
      [placa]
    );
    if (!vehiculo.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No existe un vehículo activo con esa placa' });
    }

    const abierto = await client.query(
      `SELECT id, fecha_hora_entrada FROM accesos
       WHERE vehiculo_placa = $1 AND fecha_hora_salida IS NULL
       FOR UPDATE`,
      [placa]
    );

    let resultado;
    if (abierto.rows[0]) {
      const salida = await client.query(
        `UPDATE accesos SET fecha_hora_salida = NOW()
         WHERE id = $1
         RETURNING id, vehiculo_placa, fecha_hora_entrada, fecha_hora_salida, puerta`,
        [abierto.rows[0].id]
      );
      resultado = { tipo: 'salida', acceso: salida.rows[0] };
    } else {
      const entrada = await client.query(
        `INSERT INTO accesos (vehiculo_placa, operador_matricula, puerta, metodo_registro, foto_evidencia, observaciones)
         VALUES ($1, $2, $3, $4::metodo_registro, $5, $6)
         RETURNING id, vehiculo_placa, fecha_hora_entrada, puerta`,
        [placa, req.usuario.matricula_academica, puerta, metodo, req.body.foto_evidencia || null, req.body.observaciones || null]
      );
      resultado = { tipo: 'entrada', acceso: entrada.rows[0] };
    }

    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, detalles) VALUES ($1, $2, $3::jsonb)`,
      [req.usuario.id, resultado.tipo === 'entrada' ? 'REGISTRO_ENTRADA' : 'REGISTRO_SALIDA', JSON.stringify({ placa, puerta })]
    );
    await client.query('COMMIT');
    return res.json(resultado);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ error: 'El acceso fue actualizado por otro operador' });
    console.error('Error al registrar acceso:', error.message);
    return res.status(500).json({ error: 'No se pudo registrar el acceso' });
  } finally {
    client.release();
  }
}

async function vehiculosDentro(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.vehiculo_placa AS placa, a.fecha_hora_entrada, a.puerta, a.metodo_registro,
              u.nombres, u.apellidos, u.matricula_academica
       FROM accesos a
       JOIN vehiculos v ON v.placa = a.vehiculo_placa
       JOIN usuarios u ON u.matricula_academica = v.propietario_matricula
       WHERE a.fecha_hora_salida IS NULL
       ORDER BY a.fecha_hora_entrada DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos dentro:', error.message);
    return res.status(500).json({ error: 'No se pudo obtener el estado del campus' });
  }
}

async function miHistorial(req, res) {
  try {
    let query;
    let params;
    if (req.usuario.rol === 'superadmin') {
      query = `SELECT a.*, v.propietario_matricula, u.nombres, u.apellidos
               FROM accesos a
               JOIN vehiculos v ON v.placa = a.vehiculo_placa
               JOIN usuarios u ON u.matricula_academica = v.propietario_matricula
               ORDER BY a.fecha_hora_entrada DESC LIMIT 200`;
      params = [];
    } else if (req.usuario.rol === 'operador') {
      query = `SELECT a.* FROM accesos a
               WHERE a.operador_matricula = $1
               ORDER BY a.fecha_hora_entrada DESC LIMIT 200`;
      params = [req.usuario.matricula_academica];
    } else {
      query = `SELECT a.* FROM accesos a
               JOIN vehiculos v ON v.placa = a.vehiculo_placa
               WHERE v.propietario_matricula = $1
               ORDER BY a.fecha_hora_entrada DESC LIMIT 200`;
      params = [req.usuario.matricula_academica];
    }
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    return res.status(500).json({ error: 'No se pudo obtener el historial' });
  }
}

module.exports = { registrarAcceso, vehiculosDentro, miHistorial };

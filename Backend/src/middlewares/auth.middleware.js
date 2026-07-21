const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No se proporcionó un token' });

  try {
    const decodificado = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function soloSuperadmin(req, res, next) {
  if (req.usuario.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Requiere permisos de administrador' });
  }
  next();
}

module.exports = { verificarToken, soloSuperadmin };
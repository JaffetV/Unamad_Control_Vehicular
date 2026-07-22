const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [esquema, token] = authorization.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere un token Bearer válido' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.usuario = decodificado;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function soloRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

const soloSuperadmin = soloRoles('superadmin');

module.exports = { verificarToken, soloRoles, soloSuperadmin };

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la solicitud');
  return body;
}

function conToken(token) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  login: (identificador, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ identificador, password }) }),
  registro: (datos) => request('/auth/registro', { method: 'POST', body: JSON.stringify(datos) }),
  miPerfil: (token) => request('/auth/me', { headers: conToken(token) }),
  vehiculos: (token) => request('/vehiculos', { headers: conToken(token) }),
  historial: (token) => request('/accesos/historial', { headers: conToken(token) }),
  vehiculosDentro: (token) => request('/accesos/dentro-ahora', { headers: conToken(token) }),
};

# Despliegue: Neon, Railway y Vercel

## 1. Base de datos en Neon

1. Crea el proyecto `unamad-control-vehicular` en Neon y copia su cadena de conexión.
2. Ejecuta el esquema y la escuela inicial desde una terminal con `psql`:

```bash
psql "TU_CONNECTION_STRING" -f database/schema.sql
psql "TU_CONNECTION_STRING" -c "INSERT INTO escuelas_profesionales (nombre_escuela, facultad) VALUES ('Ingeniería de Sistemas e Informática', 'Facultad de Ingeniería');"
```

## 2. API en Railway

Conecta este repositorio, selecciona `Backend` como **Root Directory** y agrega estas variables:

```text
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://TU-PROYECTO.vercel.app
JWT_SECRET=<secreto aleatorio de al menos 32 caracteres>
JWT_EXPIRES_IN=1h
DATABASE_URL=<cadena de conexión de Neon>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

También se admiten `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en lugar de `DATABASE_URL`.

## 3. Interfaz en Vercel

Importa el repositorio con `Frontend` como **Root Directory** y configura, para Production y Preview:

```text
VITE_API_URL=https://TU-API.up.railway.app/api
```

Después actualiza `CORS_ORIGIN` en Railway con la URL final de Vercel y redepliega la API.

## 4. Verificación

```bash
curl https://TU-API.up.railway.app/
```

Debe responder un JSON con `"estado":"ok"`. Finalmente registra un estudiante de prueba, inicia sesión y prueba una entrada/salida con una cuenta de operador o superadmin.

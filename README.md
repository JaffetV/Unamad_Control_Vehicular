# Control Vehicular UNAMAD

Sistema web para el registro y monitoreo de ingresos vehiculares de la Universidad Nacional Amazónica de Madre de Dios.

## Estructura

```text
Backend/        API Express y PostgreSQL
Frontend/       Interfaz React + Vite
database/       Esquema inicial de PostgreSQL
```

## Arranque local

1. Crea la base de datos `unamad_control_vehicular` y ejecuta [database/schema.sql](database/schema.sql).
   Si la base ya existía, aplica también [database/migrations/001_foto_perfil.sql](database/migrations/001_foto_perfil.sql).
2. Inserta al menos una escuela profesional, por ejemplo:

```sql
INSERT INTO escuelas_profesionales (nombre_escuela, facultad)
VALUES ('Ingeniería de Sistemas e Informática', 'Facultad de Ingeniería');
```

3. Copia `Backend/.env.example` como `Backend/.env` y configura PostgreSQL y un `JWT_SECRET` de más de 32 caracteres.
4. En una terminal, inicia la API:

```bash
cd Backend
npm install
npm run dev
```

5. En otra terminal, inicia el frontend:

```bash
cd Frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El proxy de Vite redirige automáticamente `/api` a `http://localhost:4000`.

## Roles y permisos

| Rol | Permisos |
| --- | --- |
| Estudiante | Registro y consulta de sus propios vehículos e historial. |
| Operador | Registro de entradas/salidas y consulta de sus operaciones. |
| Superadmin | Consulta global, gestión de vehículos y control de accesos. |

Las contraseñas requieren 12 caracteres, mayúscula, minúscula y número. Los tokens se guardan por sesión en el navegador; nunca se deben versionar archivos `.env`.

## MVP implementado

- Registro, autenticación y panel del estudiante con historial real.
- Registro manual de entrada/salida para operadores y superadministradores.
- Gestión de vehículos, usuarios y carreras para superadministradores.
- Foto de perfil validada (PNG, JPEG o WebP; hasta 2 MB) guardada localmente en `Backend/uploads/`.

Para producción, el directorio `Backend/uploads/` debe montarse en almacenamiento persistente (por ejemplo, un volumen o un servicio de archivos); el disco efímero de una plataforma PaaS no conserva las fotos entre despliegues.
# Unamad_Control_Vehicular
# Unamad_Control_Vehicular
# Unamad_Control_Vehicular

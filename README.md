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
# Unamad_Control_Vehicular
# Unamad_Control_Vehicular

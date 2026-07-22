-- Control Vehicular UNAMAD - Esquema inicial PostgreSQL
-- Ejecutar con una base de datos vacía o durante la primera migración.

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE rol_usuario AS ENUM ('estudiante', 'operador', 'superadmin');
CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo', 'bloqueado');
CREATE TYPE estado_vehiculo AS ENUM ('activo', 'inactivo', 'suspendido');
CREATE TYPE tipo_vehiculo AS ENUM ('auto', 'moto', 'camioneta', 'bicicleta', 'otro');
CREATE TYPE metodo_registro AS ENUM ('manual_web', 'manual_movil', 'ocr_camara', 'codigo_qr');

CREATE TABLE escuelas_profesionales (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_escuela VARCHAR(150) NOT NULL,
    facultad VARCHAR(150) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_escuelas_profesionales_nombre_facultad
        UNIQUE (nombre_escuela, facultad)
);

CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_institucional CITEXT NOT NULL UNIQUE,
    matricula_academica VARCHAR(30) NOT NULL UNIQUE,
    carrera_id BIGINT REFERENCES escuelas_profesionales(id) ON DELETE RESTRICT,
    rol rol_usuario NOT NULL DEFAULT 'estudiante',
    estado estado_usuario NOT NULL DEFAULT 'activo',
    password_hash TEXT NOT NULL,
    intentos_fallidos SMALLINT NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
    bloqueado_hasta TIMESTAMPTZ,
    debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login TIMESTAMPTZ,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_usuarios_matricula_no_vacia
        CHECK (btrim(matricula_academica) <> ''),
    CONSTRAINT ck_usuarios_correo_institucional_no_vacio
        CHECK (btrim(correo_institucional::TEXT) <> '')
);

CREATE TABLE vehiculos (
    placa VARCHAR(10) PRIMARY KEY,
    propietario_matricula VARCHAR(30) NOT NULL
        REFERENCES usuarios(matricula_academica) ON DELETE RESTRICT,
    marca VARCHAR(60),
    modelo VARCHAR(60),
    color VARCHAR(40),
    tipo tipo_vehiculo NOT NULL DEFAULT 'auto',
    estado estado_vehiculo NOT NULL DEFAULT 'activo',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_vehiculos_placa_formato
        CHECK (placa = upper(placa) AND placa ~ '^[A-Z0-9]{2,4}-?[A-Z0-9]{2,4}$')
);

CREATE TABLE accesos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehiculo_placa VARCHAR(10) NOT NULL
        REFERENCES vehiculos(placa) ON DELETE RESTRICT,
    fecha_hora_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_hora_salida TIMESTAMPTZ,
    operador_matricula VARCHAR(30) NOT NULL
        REFERENCES usuarios(matricula_academica) ON DELETE RESTRICT,
    puerta VARCHAR(80) NOT NULL,
    metodo_registro metodo_registro NOT NULL DEFAULT 'manual_web',
    foto_evidencia TEXT,
    observaciones VARCHAR(500),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_accesos_puerta_no_vacia CHECK (btrim(puerta) <> ''),
    CONSTRAINT ck_accesos_salida_posterior_a_entrada
        CHECK (fecha_hora_salida IS NULL OR fecha_hora_salida >= fecha_hora_entrada)
);

CREATE TABLE auditoria (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(120) NOT NULL,
    detalles JSONB NOT NULL DEFAULT '{}'::JSONB,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_auditoria_accion_no_vacia CHECK (btrim(accion) <> '')
);

CREATE INDEX idx_usuarios_carrera_id ON usuarios(carrera_id);
CREATE INDEX idx_usuarios_rol_estado ON usuarios(rol, estado);
CREATE INDEX idx_vehiculos_propietario_matricula ON vehiculos(propietario_matricula);
CREATE INDEX idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX idx_accesos_vehiculo_placa ON accesos(vehiculo_placa);
CREATE INDEX idx_accesos_operador_matricula ON accesos(operador_matricula);
CREATE INDEX idx_accesos_fecha_entrada ON accesos(fecha_hora_entrada DESC);
CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(usuario_id, fecha DESC);

-- Un vehículo solo puede permanecer una vez dentro del campus a la vez.
CREATE UNIQUE INDEX uq_accesos_un_ingreso_abierto_por_vehiculo
    ON accesos(vehiculo_placa)
    WHERE fecha_hora_salida IS NULL;

CREATE OR REPLACE FUNCTION actualizar_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_actualizado_en
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

CREATE TRIGGER trg_vehiculos_actualizado_en
BEFORE UPDATE ON vehiculos
FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

COMMIT;

const { Pool } = require('pg');

const ssl = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  : undefined;

const configuracionBase = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

const pool = new Pool({
  ...configuracionBase,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl,
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

module.exports = pool;

const { Pool } = require('pg');

const localPoolConfig = {
  user: 'postgres',
  password: 'ola23',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // This should match the database created
};

const poolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
} : localPoolConfig;

const pool = new Pool(poolConfig);

module.exports = pool;

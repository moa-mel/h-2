const { Pool } = require('pg');
require('dotenv').config();

const localPoolConfig = {

    user: 'postgres',
    password: 'ola23',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  

};

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
   /* ssl: {
        rejectUnauthorized: false
    } */
} : localPoolConfig;

const pool = new Pool(poolConfig);

module.exports = pool;

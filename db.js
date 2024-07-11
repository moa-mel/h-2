const { Pool } = require('pg');
require('dotenv').config();

const localPoolConfig = {

    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE,
  

};

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
   /* ssl: {
        rejectUnauthorized: false
    } */
} : localPoolConfig;

const pool = new Pool(poolConfig);

module.exports = pool;

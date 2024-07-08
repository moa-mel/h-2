const pool = require('../db');

const createUser = async (user) => {
  const { user_name, user_email, user_password } = user;
  const query = `
    INSERT INTO users (user_name, user_email, user_password)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const values = [user_name, user_email, user_password];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findUserByEmail = async (user_email) => {
  const query = `
    SELECT * FROM users WHERE user_email = $1;
  `;
  const values = [user_email];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findUserById = async (user_id) => {
  const query = `
    SELECT * FROM users WHERE user_id = $1;
  `;
  const values = [user_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};

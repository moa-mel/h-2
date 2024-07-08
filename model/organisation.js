const pool = require('../db');

const createOrganisation = async (org) => {
  const { name, description } = org;
  const query = `
    INSERT INTO organisations (name, description)
    VALUES ($1, $2) RETURNING *;
  `;
  const values = [name, description];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const addUserToOrganisation = async (userId, orgId) => {
    try {
      // Check if the association already exists
      const existingRecord = await pool.query(
        'SELECT * FROM user_organisations WHERE user_id = $1 AND org_id = $2',
        [userId, orgId]
      );
  
      if (existingRecord.rows.length > 0) {
        throw new Error('User is already associated with this organisation');
      }
  
      // If not exists, proceed with the insertion
      const query = `
        INSERT INTO user_organisations (user_id, org_id)
        VALUES ($1, $2) RETURNING *;
      `;
      const values = [userId, orgId];
      const result = await pool.query(query, values);
  
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };
  
  

  const findUserOrganisations = async (userId) => {
    const query = `
      SELECT o.* FROM organisations o
      JOIN user_organisations uo ON o.org_id = uo.org_id
      WHERE uo.user_id = $1;
    `;
    const values = [userId];
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  };
  

module.exports = {
  createOrganisation,
  addUserToOrganisation,
  findUserOrganisations
};

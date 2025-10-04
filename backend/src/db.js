// backend/src/db.js
// This module sets up and exports the PostgreSQL connection pool.

const { Pool } = require('pg');

const pool = new Pool({
  // Using connectionString allows using the full DATABASE_URL variable
  connectionString: process.env.DATABASE_URL,
 
});

// A simple utility to execute queries
const query = (text, params) => pool.query(text, params);

// Export the pool and query utility
module.exports = {
  pool,
  query,
};

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'genesis_meat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertimos el pool a promesas para poder usar async/await
const promisePool = pool.promise();

module.exports = promisePool;

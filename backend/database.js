const mysql = require('mysql2');

// Use a pool so controllers can call db.getConnection() for transactions
// AND db.query() for simple fire-and-forget queries.
const db = mysql.createPool({
  host:              'localhost',
  user:              'root',
  password:          'localhost@123',
  database:          'almamatters',
  waitForConnections: true,
  connectionLimit:    10,
});

db.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL pool connection failed:', err.message);
  } else {
    console.log('MySQL Pool Connected');
    conn.release();
  }
});

module.exports = db;

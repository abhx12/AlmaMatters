const db = require('./database');

async function addColumn() {
  try {
    // Try to add the column
    await db.query(`
      ALTER TABLE sessions 
      ADD COLUMN approved_by_admin_id BIGINT;
    `);
    console.log("Added approved_by_admin_id column successfully.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.error("Error adding column:", err.message);
    }
  } finally {
    process.exit(0);
  }
}

addColumn();

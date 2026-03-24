const db = require('./database');

async function updateDatabase() {
  try {
    await db.query(`
      ALTER TABLE user_followers 
      ADD COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending';
    `);
    console.log("Successfully added status column to user_followers.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("status column already exists in user_followers.");
    } else {
      console.error("Error updating database:", err.message);
    }
  } finally {
    process.exit(0);
  }
}

updateDatabase();

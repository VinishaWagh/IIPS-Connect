const pool = require("./db");

// Create password reset tokens table
async function createPasswordResetTokensTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Password reset tokens table created successfully");
  } catch (error) {
    console.error("✗ Error creating password reset tokens table:", error.message);
  }
}

// Run the migration
createPasswordResetTokensTable().then(() => {
  console.log("Migration complete");
  process.exit(0);
}).catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
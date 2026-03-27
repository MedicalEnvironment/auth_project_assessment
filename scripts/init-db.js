const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function waitForDatabase(maxRetries = 30) {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: 'postgres',
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Connecting to database...`);
      const client = await pool.connect();
      client.release();
      console.log('✓ Database is ready!');
      await pool.end();
      return true;
    } catch (error) {
      console.log(`✗ Connection failed: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying (exponential backoff capped at 2s)
      const delay = Math.min(1000 * attempt / 5, 2000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function initializeDatabase() {
  try {
    // Wait for database to be ready
    await waitForDatabase();

    const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
    });

    console.log('Executing migrations...');
    const client = await pool.connect();

    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations/001_create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);
    console.log('✓ Migrations completed successfully');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

initializeDatabase();

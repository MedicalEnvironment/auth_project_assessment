const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

async function createAPIKey() {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
  });

  try {
    const clientName = process.argv[2] || 'default-client';
    const suppressOutput = process.argv.includes('--no-print') || process.env.NO_PRINT_API_KEY === 'true';
    const apiKey = crypto.randomBytes(32).toString('hex');

    console.log(`Creating API key for client: ${clientName}`);

    const client = await pool.connect();

    const query = `
      INSERT INTO api_keys (api_key, client_name, created_at)
      VALUES ($1, $2, NOW())
      RETURNING api_key, client_name, created_at;
    `;

    const result = await client.query(query, [apiKey, clientName]);
    const newKey = result.rows[0];

    console.log('\nAPI Key created successfully:');
    if (!suppressOutput) {
      console.log(`API Key: ${newKey.api_key}`);
    } else {
      console.log('API Key value suppressed (use --no-print=false or unset NO_PRINT_API_KEY).');
    }
    console.log(`Client Name: ${newKey.client_name}`);
    console.log(`Created At: ${newKey.created_at}`);
    if (!suppressOutput) {
      console.log('\nUse this API key in the X-API-Key header for all requests.');
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error creating API key:', error);
    process.exit(1);
  }
}

createAPIKey();

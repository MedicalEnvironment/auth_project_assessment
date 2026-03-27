const pool = require('../config/database');
const crypto = require('crypto');

class APIKeyModel {
  // Create API key for a client
  static async createAPIKey(clientName) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const query = `
      INSERT INTO api_keys (api_key, client_name, created_at, last_used)
      VALUES ($1, $2, NOW(), NULL)
      RETURNING api_key, client_name, created_at;
    `;

    const result = await pool.query(query, [apiKey, clientName]);
    return result.rows[0];
  }

  // Get API key by key
  static async getAPIKey(apiKey) {
    const query = 'SELECT api_key, client_name, created_at, last_used, is_active FROM api_keys WHERE api_key = $1;';
    const result = await pool.query(query, [apiKey]);
    return result.rows[0];
  }

  // Update last used timestamp
  static async updateLastUsed(apiKey) {
    const query = 'UPDATE api_keys SET last_used = NOW() WHERE api_key = $1;';
    await pool.query(query, [apiKey]);
  }
}

module.exports = APIKeyModel;

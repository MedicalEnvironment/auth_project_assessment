const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const BCRYPT_SALT_ROUNDS = 10;

class UserModel {
  // Create a new user
  static async createUser(userData) {
    const {
      username,
      fullName,
      email,
      mobileNumber,
      language,
      culture,
      password
    } = userData;

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const query = `
      INSERT INTO users (id, username, full_name, email, mobile_number, language, culture, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, username, full_name, email, mobile_number, language, culture, created_at, updated_at;
    `;

    const result = await pool.query(query, [
      userId,
      username,
      fullName,
      email,
      mobileNumber,
      language,
      culture,
      hashedPassword
    ]);

    return result.rows[0];
  }

  // Get user by ID
  static async getUserById(userId) {
    const query = 'SELECT id, username, full_name, email, mobile_number, language, culture, created_at, updated_at FROM users WHERE id = $1;';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get user by username
  static async getUserByUsername(username) {
    const query = 'SELECT id, username, full_name, email, mobile_number, language, culture, created_at, updated_at FROM users WHERE username = $1;';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Get all users
  static async getAllUsers() {
    const query = 'SELECT id, username, full_name, email, mobile_number, language, culture, created_at, updated_at FROM users ORDER BY created_at DESC;';
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user
  static async updateUser(userId, userData) {
    const {
      username,
      fullName,
      email,
      mobileNumber,
      language,
      culture,
      password
    } = userData;

    // If password is provided, hash it and include in update
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }

    const query = `
      UPDATE users 
      SET username = COALESCE($2, username),
          full_name = COALESCE($3, full_name),
          email = COALESCE($4, email),
          mobile_number = COALESCE($5, mobile_number),
          language = COALESCE($6, language),
          culture = COALESCE($7, culture),
          password = COALESCE($8, password),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, full_name, email, mobile_number, language, culture, created_at, updated_at;
    `;

    const result = await pool.query(query, [
      userId,
      username,
      fullName,
      email,
      mobileNumber,
      language,
      culture,
      hashedPassword
    ]);

    return result.rows[0];
  }

  // Delete user
  static async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  // Validate password
  static async validatePassword(userId, password) {
    const query = 'SELECT password FROM users WHERE id = $1;';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return false;
    }

    const hashedPassword = result.rows[0].password;
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = UserModel;

const UserModel = require('../models/userModel');
const logger = require('../config/logger');
const { validateEmail, validateUsername, validatePassword: validatePwd, validateFullName, validateMobileNumber } = require('../middleware/validateInput');

/** Map a DB row (snake_case) to a camelCase API response object. */
function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    mobileNumber: user.mobile_number,
    language: user.language,
    culture: user.culture,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

class UserController {
  // Add a new user
  static async addUser(req, res) {
    try {
      const { username, fullName, email, mobileNumber, language, culture, password } = req.body;

      // Validate required fields
      if (!username || !fullName || !email || !password) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'POST /users',
          { username },
          'Missing required fields'
        );
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: username, fullName, email, password'
        });
      }

      if (!validateUsername(username)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid username. Must be 3-50 characters, alphanumeric with _ . - only'
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      if (!validatePwd(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        });
      }

      if (!validateFullName(fullName)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid full name. Must contain only letters, spaces, hyphens, or apostrophes'
        });
      }

      if (mobileNumber !== undefined && mobileNumber !== null && !validateMobileNumber(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Must contain only digits (7-15), optionally prefixed with +'
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'POST /users',
          { username },
          'User already exists'
        );
        return res.status(409).json({
          success: false,
          message: 'User already exists'
        });
      }

      const newUser = await UserModel.createUser({
        username,
        fullName,
        email,
        mobileNumber: mobileNumber || null,
        language: language || null,
        culture: culture || null,
        password
      });

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'POST /users',
        { username },
        `User created successfully: ${username}`
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: formatUserResponse(newUser)
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'POST /users',
        { username: req.body?.username },
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user by ID
  static async getUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserModel.getUserById(userId);

      if (!user) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'GET /users/:userId',
          { userId },
          'User not found'
        );
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'GET /users/:userId',
        { userId },
        `User retrieved: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: formatUserResponse(user)
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'GET /users/:userId',
        req.params,
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'GET /users',
        {},
        `Retrieved ${users.length} users`
      );

      res.status(200).json({
        success: true,
        data: users.map(formatUserResponse)
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'GET /users',
        {},
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { username, fullName, email, mobileNumber, language, culture, password } = req.body;

      // Validate optional fields if provided
      if (username !== undefined && !validateUsername(username)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid username. Must be 3-50 characters, alphanumeric with _ . - only'
        });
      }

      if (email !== undefined && !validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      if (password !== undefined && !validatePwd(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        });
      }

      if (fullName !== undefined && !validateFullName(fullName)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid full name. Must contain only letters, spaces, hyphens, or apostrophes'
        });
      }

      if (mobileNumber !== undefined && !validateMobileNumber(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Must contain only digits (7-15), optionally prefixed with +'
        });
      }

      // Check if user exists
      const user = await UserModel.getUserById(userId);
      if (!user) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'PUT /users/:userId',
          { userId },
          'User not found'
        );
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await UserModel.updateUser(userId, {
        username,
        fullName,
        email,
        mobileNumber,
        language,
        culture,
        password
      });

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'PUT /users/:userId',
        { userId },
        `User updated: ${userId}`
      );

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: formatUserResponse(updatedUser)
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'PUT /users/:userId',
        { userId: req.params.userId },
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Check if user exists
      const user = await UserModel.getUserById(userId);
      if (!user) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'DELETE /users/:userId',
          { userId },
          'User not found'
        );
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await UserModel.deleteUser(userId);

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'DELETE /users/:userId',
        { userId },
        `User deleted: ${userId}`
      );

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'DELETE /users/:userId',
        req.params,
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Validate password
  static async validatePassword(req, res) {
    try {
      const { userId } = req.params;
      const { password } = req.body;

      if (!password) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'POST /users/:userId/validate-password',
          { userId },
          'Missing password'
        );
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      // Check if user exists
      const user = await UserModel.getUserById(userId);
      if (!user) {
        logger.error(
          req.apiKey.clientIP,
          req.apiKey.clientName,
          'POST /users/:userId/validate-password',
          { userId },
          'User not found'
        );
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isValid = await UserModel.validatePassword(userId, password);

      logger.info(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'POST /users/:userId/validate-password',
        { userId },
        `Password validation: ${isValid ? 'valid' : 'invalid'}`
      );

      res.status(200).json({
        success: true,
        data: {
          isValid: isValid
        }
      });
    } catch (error) {
      logger.error(
        req.apiKey.clientIP,
        req.apiKey.clientName,
        'POST /users/:userId/validate-password',
        { userId: req.params.userId },
        `Error: ${error.message}`
      );
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = UserController;

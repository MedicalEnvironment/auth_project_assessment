const express = require('express');
const UserController = require('../controllers/userController');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const { validateUUID } = require('../middleware/validateInput');

const router = express.Router();

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// User endpoints
router.post('/', UserController.addUser);
router.get('/', UserController.getAllUsers);
router.get('/:userId', validateUUID('userId'), UserController.getUser);
router.put('/:userId', validateUUID('userId'), UserController.updateUser);
router.delete('/:userId', validateUUID('userId'), UserController.deleteUser);
router.post('/:userId/validate-password', validateUUID('userId'), UserController.validatePassword);

module.exports = router;

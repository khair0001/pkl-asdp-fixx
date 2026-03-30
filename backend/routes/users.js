const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', adminMiddleware, UserController.getAllUsers);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Create new user (admin only)
router.post('/', adminMiddleware, UserController.createUser);

// Update user (admin only)
router.put('/:id', adminMiddleware, UserController.updateUser);

// Update password (admin only)
router.put('/:id/password', adminMiddleware, UserController.updatePassword);

// Soft delete user (admin only)
router.delete('/:id', adminMiddleware, UserController.deleteUser);

// Hard delete user (admin only)
router.delete('/:id/hard', adminMiddleware, UserController.hardDeleteUser);

module.exports = router;

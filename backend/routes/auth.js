const express = require('express');
const router = express.Router();
const AuthController = require('../controller/AuthController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;

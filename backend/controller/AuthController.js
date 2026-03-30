const UserModel = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, password, nama_lengkap } = req.body;

      if (!username || !password || !nama_lengkap) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
      }

      const user = await UserModel.register(username, password, nama_lengkap);
      
      res.status(201).json({
        message: 'User berhasil didaftarkan',
        data: {
          user_id: user.user_id,
          username: user.username,
          nama_lengkap: user.nama_lengkap
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
      }

      const user = await UserModel.login(username, password);

      const token = jwt.sign(
        { 
          user_id: user.user_id, 
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      res.json({
        message: 'Login berhasil',
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserModel.getUserById(req.user.user_id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

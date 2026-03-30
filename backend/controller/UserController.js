const UserModel = require('../models/User');

class UserController {
  // Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.getUserById(id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Create new user (admin only)
  static async createUser(req, res) {
    try {
      const { username, password, nama_lengkap, role } = req.body;

      if (!username || !password || !nama_lengkap) {
        return res.status(400).json({ error: 'Username, password, dan nama lengkap wajib diisi' });
      }

      const user = await UserModel.register(username, password, nama_lengkap, role || 'user');
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user (admin only)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, nama_lengkap, role, is_active } = req.body;

      const user = await UserModel.updateUser(id, {
        username,
        nama_lengkap,
        role,
        is_active
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update password
  static async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password wajib diisi' });
      }

      const result = await UserModel.updatePassword(id, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete user (soft delete - admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user.user_id === parseInt(id)) {
        return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
      }

      const result = await UserModel.deleteUser(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Hard delete user (admin only)
  static async hardDeleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user.user_id === parseInt(id)) {
        return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
      }

      const result = await UserModel.hardDeleteUser(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;

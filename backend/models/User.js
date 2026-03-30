const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
  // Register user baru
  static async register(username, password, nama_lengkap, role = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, role]
    );

    const [user] = await pool.query(
      'SELECT user_id, username, nama_lengkap, role, is_active, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    return user[0];
  }

  // Login user
  static async login(username, password) {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND is_active = ?',
      [username, true]
    );

    if (!users || users.length === 0) {
      throw new Error('Username atau password salah');
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new Error('Username atau password salah');
    }

    return user;
  }

  // Get user by ID
  static async getUserById(user_id) {
    const [users] = await pool.query(
      'SELECT user_id, username, nama_lengkap, role, is_active FROM users WHERE user_id = ?',
      [user_id]
    );

    if (!users || users.length === 0) {
      throw new Error('User tidak ditemukan');
    }

    return users[0];
  }

  // Get all users
  static async getAllUsers() {
    const [users] = await pool.query(
      'SELECT user_id, username, nama_lengkap, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    return users;
  }

  // Update user (admin only)
  static async updateUser(user_id, { username, nama_lengkap, role, is_active }) {
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (nama_lengkap !== undefined) {
      updates.push('nama_lengkap = ?');
      values.push(nama_lengkap);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      throw new Error('Tidak ada data yang diupdate');
    }

    values.push(user_id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return await this.getUserById(user_id);
  }

  // Update password
  static async updatePassword(user_id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, user_id]
    );

    return { message: 'Password berhasil diupdate' };
  }

  // Delete user (soft delete)
  static async deleteUser(user_id) {
    await pool.query(
      'UPDATE users SET is_active = false WHERE user_id = ?',
      [user_id]
    );

    return { message: 'User berhasil dihapus' };
  }

  // Hard delete user
  static async hardDeleteUser(user_id) {
    await pool.query(
      'DELETE FROM users WHERE user_id = ?',
      [user_id]
    );

    return { message: 'User berhasil dihapus permanen' };
  }
}

module.exports = UserModel;

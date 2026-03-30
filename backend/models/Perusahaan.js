const pool = require('../config/database');

class PerusahaanModel {
  // Get all perusahaan
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM perusahaan WHERE is_active = ? ORDER BY nama_perusahaan',
      [true]
    );
    return rows;
  }

  // Get by ID
  static async getById(perusahaan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM perusahaan WHERE perusahaan_id = ?',
      [perusahaan_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Perusahaan tidak ditemukan');
    }

    return rows[0];
  }

  // Create
  static async create(nama_perusahaan) {
    const [result] = await pool.query(
      'INSERT INTO perusahaan (nama_perusahaan) VALUES (?)',
      [nama_perusahaan]
    );

    const [rows] = await pool.query(
      'SELECT * FROM perusahaan WHERE perusahaan_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(perusahaan_id, nama_perusahaan) {
    await pool.query(
      'UPDATE perusahaan SET nama_perusahaan = ? WHERE perusahaan_id = ?',
      [nama_perusahaan, perusahaan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM perusahaan WHERE perusahaan_id = ?',
      [perusahaan_id]
    );

    return rows[0];
  }

  // Delete (soft delete)
  static async delete(perusahaan_id) {
    await pool.query(
      'UPDATE perusahaan SET is_active = ? WHERE perusahaan_id = ?',
      [false, perusahaan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM perusahaan WHERE perusahaan_id = ?',
      [perusahaan_id]
    );

    return rows[0];
  }
}

module.exports = PerusahaanModel;

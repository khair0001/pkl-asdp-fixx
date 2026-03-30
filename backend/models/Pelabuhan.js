const pool = require('../config/database');

class PelabuhanModel {
  // Get all pelabuhan
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM pelabuhan WHERE is_active = ? ORDER BY nama_pelabuhan',
      [true]
    );
    return rows;
  }

  // Get by ID
  static async getById(pelabuhan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM pelabuhan WHERE pelabuhan_id = ?',
      [pelabuhan_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Pelabuhan tidak ditemukan');
    }

    return rows[0];
  }

  // Create
  static async create(nama_pelabuhan, lokasi) {
    const [result] = await pool.query(
      'INSERT INTO pelabuhan (nama_pelabuhan, lokasi) VALUES (?, ?)',
      [nama_pelabuhan, lokasi]
    );

    const [rows] = await pool.query(
      'SELECT * FROM pelabuhan WHERE pelabuhan_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(pelabuhan_id, nama_pelabuhan, lokasi) {
    await pool.query(
      'UPDATE pelabuhan SET nama_pelabuhan = ?, lokasi = ? WHERE pelabuhan_id = ?',
      [nama_pelabuhan, lokasi, pelabuhan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM pelabuhan WHERE pelabuhan_id = ?',
      [pelabuhan_id]
    );

    return rows[0];
  }

  // Delete (soft delete)
  static async delete(pelabuhan_id) {
    await pool.query(
      'UPDATE pelabuhan SET is_active = ? WHERE pelabuhan_id = ?',
      [false, pelabuhan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM pelabuhan WHERE pelabuhan_id = ?',
      [pelabuhan_id]
    );

    return rows[0];
  }
}

module.exports = PelabuhanModel;

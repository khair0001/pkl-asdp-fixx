const pool = require('../config/database');

class SuratDokumenModel {
  // Get data surat dokumen yang aktif (biasanya hanya 1 record)
  static async getActive() {
    const [rows] = await pool.query(`
      SELECT * FROM surat_dokumen 
      WHERE is_active = ? 
      ORDER BY surat_id DESC 
      LIMIT 1
    `, [true]);

    if (!rows || rows.length === 0) {
      throw new Error('Data surat dokumen tidak ditemukan. Silakan tambahkan data terlebih dahulu.');
    }

    return rows[0];
  }

  // Get all
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT * FROM surat_dokumen 
      WHERE is_active = ? 
      ORDER BY surat_id DESC
    `, [true]);

    return rows;
  }

  // Get by ID
  static async getById(surat_id) {
    const [rows] = await pool.query(
      'SELECT * FROM surat_dokumen WHERE surat_id = ?',
      [surat_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Data surat dokumen tidak ditemukan');
    }

    return rows[0];
  }

  // Create
  static async create(no_dokumen, revisi, halaman, general_manager, manager_usaha) {
    const [result] = await pool.query(
      'INSERT INTO surat_dokumen (no_dokumen, revisi, halaman, general_manager, manager_usaha) VALUES (?, ?, ?, ?, ?)',
      [no_dokumen, revisi, halaman, general_manager, manager_usaha]
    );

    const [rows] = await pool.query(
      'SELECT * FROM surat_dokumen WHERE surat_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(surat_id, no_dokumen, revisi, halaman, general_manager, manager_usaha) {
    await pool.query(
      'UPDATE surat_dokumen SET no_dokumen = ?, revisi = ?, halaman = ?, general_manager = ?, manager_usaha = ? WHERE surat_id = ?',
      [no_dokumen, revisi, halaman, general_manager, manager_usaha, surat_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM surat_dokumen WHERE surat_id = ?',
      [surat_id]
    );

    return rows[0];
  }

  // Delete (soft delete)
  static async delete(surat_id) {
    await pool.query(
      'UPDATE surat_dokumen SET is_active = ? WHERE surat_id = ?',
      [false, surat_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM surat_dokumen WHERE surat_id = ?',
      [surat_id]
    );

    return rows[0];
  }
}

module.exports = SuratDokumenModel;

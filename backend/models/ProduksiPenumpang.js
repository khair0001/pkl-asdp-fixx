const pool = require('../config/database');

class ProduksiPenumpangModel {
  // Get all by produksi_id
  static async getByProduksi(produksi_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_penumpang WHERE produksi_id = ? ORDER BY produksi_penumpang_id',
      [produksi_id]
    );
    return rows;
  }

  // Get by ID
  static async getById(produksi_penumpang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_penumpang WHERE produksi_penumpang_id = ?',
      [produksi_penumpang_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Produksi penumpang tidak ditemukan');
    }

    return rows[0];
  }

  // Create
  static async create(produksi_id, kategori_penumpang_id, nama_kategori, jumlah, tarif, subtotal, is_tarif_custom = false) {
    const [result] = await pool.query(
      'INSERT INTO produksi_penumpang (produksi_id, kategori_penumpang_id, nama_kategori, jumlah, tarif, subtotal, is_tarif_custom) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [produksi_id, kategori_penumpang_id, nama_kategori, jumlah, tarif, subtotal, is_tarif_custom]
    );

    const [rows] = await pool.query(
      'SELECT * FROM produksi_penumpang WHERE produksi_penumpang_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(produksi_penumpang_id, jumlah, tarif, subtotal, is_tarif_custom = false) {
    await pool.query(
      'UPDATE produksi_penumpang SET jumlah = ?, tarif = ?, subtotal = ?, is_tarif_custom = ? WHERE produksi_penumpang_id = ?',
      [jumlah, tarif, subtotal, is_tarif_custom, produksi_penumpang_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM produksi_penumpang WHERE produksi_penumpang_id = ?',
      [produksi_penumpang_id]
    );

    return rows[0];
  }

  // Delete
  static async delete(produksi_penumpang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_penumpang WHERE produksi_penumpang_id = ?',
      [produksi_penumpang_id]
    );

    await pool.query(
      'DELETE FROM produksi_penumpang WHERE produksi_penumpang_id = ?',
      [produksi_penumpang_id]
    );

    return rows[0];
  }

  // Delete all by produksi_id
  static async deleteByProduksi(produksi_id) {
    await pool.query(
      'DELETE FROM produksi_penumpang WHERE produksi_id = ?',
      [produksi_id]
    );
    return true;
  }
}

module.exports = ProduksiPenumpangModel;

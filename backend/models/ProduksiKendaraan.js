const pool = require('../config/database');

class ProduksiKendaraanModel {
  // Get all by produksi_id
  static async getByProduksi(produksi_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_kendaraan WHERE produksi_id = ? ORDER BY nomor_golongan',
      [produksi_id]
    );
    return rows;
  }

  // Get by ID
  static async getById(produksi_kendaraan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_kendaraan WHERE produksi_kendaraan_id = ?',
      [produksi_kendaraan_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Produksi kendaraan tidak ditemukan');
    }

    return rows[0];
  }

  // Create
  static async create(produksi_id, golongan_id, nomor_golongan, tipe_muatan, jumlah, tarif, subtotal, is_tarif_custom = false) {
    const [result] = await pool.query(
      'INSERT INTO produksi_kendaraan (produksi_id, golongan_id, nomor_golongan, tipe_muatan, jumlah, tarif, subtotal, is_tarif_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [produksi_id, golongan_id, nomor_golongan, tipe_muatan, jumlah, tarif, subtotal, is_tarif_custom]
    );

    const [rows] = await pool.query(
      'SELECT * FROM produksi_kendaraan WHERE produksi_kendaraan_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(produksi_kendaraan_id, jumlah, tarif, subtotal, is_tarif_custom = false) {
    await pool.query(
      'UPDATE produksi_kendaraan SET jumlah = ?, tarif = ?, subtotal = ?, is_tarif_custom = ? WHERE produksi_kendaraan_id = ?',
      [jumlah, tarif, subtotal, is_tarif_custom, produksi_kendaraan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM produksi_kendaraan WHERE produksi_kendaraan_id = ?',
      [produksi_kendaraan_id]
    );

    return rows[0];
  }

  // Delete
  static async delete(produksi_kendaraan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM produksi_kendaraan WHERE produksi_kendaraan_id = ?',
      [produksi_kendaraan_id]
    );

    await pool.query(
      'DELETE FROM produksi_kendaraan WHERE produksi_kendaraan_id = ?',
      [produksi_kendaraan_id]
    );

    return rows[0];
  }

  // Delete all by produksi_id
  static async deleteByProduksi(produksi_id) {
    await pool.query(
      'DELETE FROM produksi_kendaraan WHERE produksi_id = ?',
      [produksi_id]
    );
    return true;
  }
}

module.exports = ProduksiKendaraanModel;

const pool = require('../config/database');

class KapalModel {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        k.*,
        p.perusahaan_id,
        p.nama_perusahaan
      FROM kapal k
      LEFT JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE k.is_active = ?
      ORDER BY k.nama_kapal
    `, [true]);

    // Format data agar mirip dengan Supabase
    return rows.map(row => ({
      ...row,
      perusahaan: row.perusahaan_id ? {
        perusahaan_id: row.perusahaan_id,
        nama_perusahaan: row.nama_perusahaan
      } : null
    }));
  }

  static async getById(kapal_id) {
    const [rows] = await pool.query(`
      SELECT 
        k.*,
        p.perusahaan_id,
        p.nama_perusahaan
      FROM kapal k
      LEFT JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE k.kapal_id = ?
    `, [kapal_id]);

    if (!rows || rows.length === 0) {
      throw new Error('Kapal tidak ditemukan');
    }

    const row = rows[0];
    return {
      ...row,
      perusahaan: row.perusahaan_id ? {
        perusahaan_id: row.perusahaan_id,
        nama_perusahaan: row.nama_perusahaan
      } : null
    };
  }

  static async getByPerusahaan(perusahaan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM kapal WHERE perusahaan_id = ? AND is_active = ? ORDER BY nama_kapal',
      [perusahaan_id, true]
    );
    return rows;
  }

  static async create(perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan) {
    const [result] = await pool.query(
      'INSERT INTO kapal (perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan) VALUES (?, ?, ?, ?, ?)',
      [perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan]
    );

    const [rows] = await pool.query(
      'SELECT * FROM kapal WHERE kapal_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  static async update(kapal_id, perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan) {
    await pool.query(
      'UPDATE kapal SET perusahaan_id = ?, nama_kapal = ?, berat_kapal = ?, kapasitas_penumpang = ?, kapasitas_kendaraan = ? WHERE kapal_id = ?',
      [perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan, kapal_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM kapal WHERE kapal_id = ?',
      [kapal_id]
    );

    return rows[0];
  }

  static async delete(kapal_id) {
    await pool.query(
      'UPDATE kapal SET is_active = ? WHERE kapal_id = ?',
      [false, kapal_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM kapal WHERE kapal_id = ?',
      [kapal_id]
    );

    return rows[0];
  }
}

module.exports = KapalModel;

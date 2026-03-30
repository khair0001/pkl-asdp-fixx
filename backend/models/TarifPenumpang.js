const pool = require('../config/database');

class TarifPenumpangModel {
  // Get all
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        tp.*,
        r.rute_id, r.nama_rute,
        pa.nama_pelabuhan as pelabuhan_asal_nama,
        pt.nama_pelabuhan as pelabuhan_tujuan_nama,
        kp.kategori_penumpang_id, kp.nama_kategori
      FROM tarif_penumpang tp
      LEFT JOIN rute r ON tp.rute_id = r.rute_id
      LEFT JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      LEFT JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      LEFT JOIN kategori_penumpang kp ON tp.kategori_penumpang_id = kp.kategori_penumpang_id
      ORDER BY tp.tarif_penumpang_id
    `);

    return rows.map(row => ({
      tarif_penumpang_id: row.tarif_penumpang_id,
      rute_id: row.rute_id,
      kategori_penumpang_id: row.kategori_penumpang_id,
      tarif: row.tarif,
      created_at: row.created_at,
      updated_at: row.updated_at,
      rute: {
        rute_id: row.rute_id,
        nama_rute: row.nama_rute,
        pelabuhan_asal: { nama_pelabuhan: row.pelabuhan_asal_nama },
        pelabuhan_tujuan: { nama_pelabuhan: row.pelabuhan_tujuan_nama }
      },
      kategori: {
        kategori_penumpang_id: row.kategori_penumpang_id,
        nama_kategori: row.nama_kategori
      }
    }));
  }

  // Get by ID
  static async getById(tarif_penumpang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM tarif_penumpang WHERE tarif_penumpang_id = ?',
      [tarif_penumpang_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Tarif penumpang tidak ditemukan');
    }

    return rows[0];
  }

  // Get by rute
  static async getByRute(rute_id) {
    const [rows] = await pool.query(`
      SELECT 
        tp.*,
        kp.kategori_penumpang_id, kp.nama_kategori
      FROM tarif_penumpang tp
      LEFT JOIN kategori_penumpang kp ON tp.kategori_penumpang_id = kp.kategori_penumpang_id
      WHERE tp.rute_id = ?
      ORDER BY tp.kategori_penumpang_id
    `, [rute_id]);

    return rows.map(row => ({
      tarif_penumpang_id: row.tarif_penumpang_id,
      rute_id: row.rute_id,
      kategori_penumpang_id: row.kategori_penumpang_id,
      tarif: row.tarif,
      created_at: row.created_at,
      updated_at: row.updated_at,
      kategori: {
        kategori_penumpang_id: row.kategori_penumpang_id,
        nama_kategori: row.nama_kategori
      }
    }));
  }

  // Create
  static async create(rute_id, kategori_penumpang_id, tarif) {
    const [result] = await pool.query(
      'INSERT INTO tarif_penumpang (rute_id, kategori_penumpang_id, tarif) VALUES (?, ?, ?)',
      [rute_id, kategori_penumpang_id, tarif]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tarif_penumpang WHERE tarif_penumpang_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(tarif_penumpang_id, rute_id, kategori_penumpang_id, tarif) {
    await pool.query(
      'UPDATE tarif_penumpang SET rute_id = ?, kategori_penumpang_id = ?, tarif = ? WHERE tarif_penumpang_id = ?',
      [rute_id, kategori_penumpang_id, tarif, tarif_penumpang_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tarif_penumpang WHERE tarif_penumpang_id = ?',
      [tarif_penumpang_id]
    );

    return rows[0];
  }

  // Delete
  static async delete(tarif_penumpang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM tarif_penumpang WHERE tarif_penumpang_id = ?',
      [tarif_penumpang_id]
    );

    await pool.query(
      'DELETE FROM tarif_penumpang WHERE tarif_penumpang_id = ?',
      [tarif_penumpang_id]
    );

    return rows[0];
  }
}

module.exports = TarifPenumpangModel;

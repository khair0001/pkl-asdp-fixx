const pool = require('../config/database');

class RuteModel {
  // Get all rute
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        pa.pelabuhan_id as pelabuhan_asal_pelabuhan_id,
        pa.nama_pelabuhan as pelabuhan_asal_nama_pelabuhan,
        pa.lokasi as pelabuhan_asal_lokasi,
        pt.pelabuhan_id as pelabuhan_tujuan_pelabuhan_id,
        pt.nama_pelabuhan as pelabuhan_tujuan_nama_pelabuhan,
        pt.lokasi as pelabuhan_tujuan_lokasi
      FROM rute r
      LEFT JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      LEFT JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      WHERE r.is_active = ?
      ORDER BY r.nama_rute
    `, [true]);

    return rows.map(row => ({
      rute_id: row.rute_id,
      pelabuhan_asal_id: row.pelabuhan_asal_id,
      pelabuhan_tujuan_id: row.pelabuhan_tujuan_id,
      nama_rute: row.nama_rute,
      jarak: row.jarak,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      pelabuhan_asal: {
        pelabuhan_id: row.pelabuhan_asal_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_asal_nama_pelabuhan,
        lokasi: row.pelabuhan_asal_lokasi
      },
      pelabuhan_tujuan: {
        pelabuhan_id: row.pelabuhan_tujuan_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_tujuan_nama_pelabuhan,
        lokasi: row.pelabuhan_tujuan_lokasi
      }
    }));
  }

  // Get by ID
  static async getById(rute_id) {
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        pa.pelabuhan_id as pelabuhan_asal_pelabuhan_id,
        pa.nama_pelabuhan as pelabuhan_asal_nama_pelabuhan,
        pa.lokasi as pelabuhan_asal_lokasi,
        pt.pelabuhan_id as pelabuhan_tujuan_pelabuhan_id,
        pt.nama_pelabuhan as pelabuhan_tujuan_nama_pelabuhan,
        pt.lokasi as pelabuhan_tujuan_lokasi
      FROM rute r
      LEFT JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      LEFT JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      WHERE r.rute_id = ?
    `, [rute_id]);

    if (!rows || rows.length === 0) {
      throw new Error('Rute tidak ditemukan');
    }

    const row = rows[0];
    return {
      rute_id: row.rute_id,
      pelabuhan_asal_id: row.pelabuhan_asal_id,
      pelabuhan_tujuan_id: row.pelabuhan_tujuan_id,
      nama_rute: row.nama_rute,
      jarak: row.jarak,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      pelabuhan_asal: {
        pelabuhan_id: row.pelabuhan_asal_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_asal_nama_pelabuhan,
        lokasi: row.pelabuhan_asal_lokasi
      },
      pelabuhan_tujuan: {
        pelabuhan_id: row.pelabuhan_tujuan_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_tujuan_nama_pelabuhan,
        lokasi: row.pelabuhan_tujuan_lokasi
      }
    };
  }

  // Get rute by pelabuhan asal
  static async getByPelabuhanAsal(pelabuhan_asal_id) {
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        pa.pelabuhan_id as pelabuhan_asal_pelabuhan_id,
        pa.nama_pelabuhan as pelabuhan_asal_nama_pelabuhan,
        pt.pelabuhan_id as pelabuhan_tujuan_pelabuhan_id,
        pt.nama_pelabuhan as pelabuhan_tujuan_nama_pelabuhan
      FROM rute r
      LEFT JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      LEFT JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      WHERE r.pelabuhan_asal_id = ? AND r.is_active = ?
      ORDER BY r.nama_rute
    `, [pelabuhan_asal_id, true]);

    return rows.map(row => ({
      rute_id: row.rute_id,
      pelabuhan_asal_id: row.pelabuhan_asal_id,
      pelabuhan_tujuan_id: row.pelabuhan_tujuan_id,
      nama_rute: row.nama_rute,
      jarak: row.jarak,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      pelabuhan_asal: {
        pelabuhan_id: row.pelabuhan_asal_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_asal_nama_pelabuhan
      },
      pelabuhan_tujuan: {
        pelabuhan_id: row.pelabuhan_tujuan_pelabuhan_id,
        nama_pelabuhan: row.pelabuhan_tujuan_nama_pelabuhan
      }
    }));
  }

  // Create
  static async create(pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak) {
    if (pelabuhan_asal_id === pelabuhan_tujuan_id) {
      throw new Error('Pelabuhan asal dan tujuan tidak boleh sama');
    }

    // Jarak boleh kosong/null
    const jarakValue = jarak && jarak !== '' ? parseFloat(jarak) : null;

    const [result] = await pool.query(
      'INSERT INTO rute (pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak) VALUES (?, ?, ?, ?)',
      [pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarakValue]
    );

    const [rows] = await pool.query(
      'SELECT * FROM rute WHERE rute_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(rute_id, pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak) {
    if (pelabuhan_asal_id === pelabuhan_tujuan_id) {
      throw new Error('Pelabuhan asal dan tujuan tidak boleh sama');
    }

    // Jarak boleh kosong/null
    const jarakValue = jarak && jarak !== '' ? parseFloat(jarak) : null;

    await pool.query(
      'UPDATE rute SET pelabuhan_asal_id = ?, pelabuhan_tujuan_id = ?, nama_rute = ?, jarak = ? WHERE rute_id = ?',
      [pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarakValue, rute_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM rute WHERE rute_id = ?',
      [rute_id]
    );

    return rows[0];
  }

  // Delete (soft delete)
  static async delete(rute_id) {
    await pool.query(
      'UPDATE rute SET is_active = ? WHERE rute_id = ?',
      [false, rute_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM rute WHERE rute_id = ?',
      [rute_id]
    );

    return rows[0];
  }
}

module.exports = RuteModel;

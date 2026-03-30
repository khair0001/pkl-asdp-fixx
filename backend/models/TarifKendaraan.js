const pool = require('../config/database');

class TarifKendaraanModel {
  // Get all
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        tk.*,
        r.rute_id, r.nama_rute,
        pa.nama_pelabuhan as pelabuhan_asal_nama,
        pt.nama_pelabuhan as pelabuhan_tujuan_nama,
        gk.golongan_id, gk.nomor_golongan, gk.tipe_muatan
      FROM tarif_kendaraan tk
      LEFT JOIN rute r ON tk.rute_id = r.rute_id
      LEFT JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      LEFT JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      LEFT JOIN golongan_kendaraan gk ON tk.golongan_id = gk.golongan_id
      ORDER BY tk.tarif_kendaraan_id
    `);

    return rows.map(row => ({
      tarif_kendaraan_id: row.tarif_kendaraan_id,
      rute_id: row.rute_id,
      golongan_id: row.golongan_id,
      tarif: row.tarif,
      created_at: row.created_at,
      updated_at: row.updated_at,
      rute: {
        rute_id: row.rute_id,
        nama_rute: row.nama_rute,
        pelabuhan_asal: { nama_pelabuhan: row.pelabuhan_asal_nama },
        pelabuhan_tujuan: { nama_pelabuhan: row.pelabuhan_tujuan_nama }
      },
      golongan: {
        golongan_id: row.golongan_id,
        nomor_golongan: row.nomor_golongan,
        tipe_muatan: row.tipe_muatan
      }
    }));
  }

  // Get by ID
  static async getById(tarif_kendaraan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM tarif_kendaraan WHERE tarif_kendaraan_id = ?',
      [tarif_kendaraan_id]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Tarif kendaraan tidak ditemukan');
    }

    return rows[0];
  }

  // Get by rute
  static async getByRute(rute_id) {
    const [rows] = await pool.query(`
      SELECT 
        tk.*,
        gk.golongan_id, gk.nomor_golongan, gk.tipe_muatan
      FROM tarif_kendaraan tk
      LEFT JOIN golongan_kendaraan gk ON tk.golongan_id = gk.golongan_id
      WHERE tk.rute_id = ?
      ORDER BY tk.golongan_id
    `, [rute_id]);

    return rows.map(row => ({
      tarif_kendaraan_id: row.tarif_kendaraan_id,
      rute_id: row.rute_id,
      golongan_id: row.golongan_id,
      tarif: row.tarif,
      created_at: row.created_at,
      updated_at: row.updated_at,
      golongan: {
        golongan_id: row.golongan_id,
        nomor_golongan: row.nomor_golongan,
        tipe_muatan: row.tipe_muatan
      }
    }));
  }

  // Create
  static async create(rute_id, golongan_id, tarif) {
    const [result] = await pool.query(
      'INSERT INTO tarif_kendaraan (rute_id, golongan_id, tarif) VALUES (?, ?, ?)',
      [rute_id, golongan_id, tarif]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tarif_kendaraan WHERE tarif_kendaraan_id = ?',
      [result.insertId]
    );

    return rows[0];
  }

  // Update
  static async update(tarif_kendaraan_id, rute_id, golongan_id, tarif) {
    await pool.query(
      'UPDATE tarif_kendaraan SET rute_id = ?, golongan_id = ?, tarif = ? WHERE tarif_kendaraan_id = ?',
      [rute_id, golongan_id, tarif, tarif_kendaraan_id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tarif_kendaraan WHERE tarif_kendaraan_id = ?',
      [tarif_kendaraan_id]
    );

    return rows[0];
  }

  // Delete
  static async delete(tarif_kendaraan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM tarif_kendaraan WHERE tarif_kendaraan_id = ?',
      [tarif_kendaraan_id]
    );

    await pool.query(
      'DELETE FROM tarif_kendaraan WHERE tarif_kendaraan_id = ?',
      [tarif_kendaraan_id]
    );

    return rows[0];
  }
}

module.exports = TarifKendaraanModel;

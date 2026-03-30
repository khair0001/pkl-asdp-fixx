const pool = require('../config/database');

class ProduksiModel {
  // Get all produksi dengan filter dan pagination
  static async getAll(filters = {}, pagination = {}) {
    // Build WHERE clause
    let whereConditions = [];
    let params = [];

    if (filters.perusahaan_id && filters.perusahaan_id.length > 0) {
      whereConditions.push(`p.perusahaan_id IN (${filters.perusahaan_id.map(() => '?').join(',')})`);
      params.push(...filters.perusahaan_id);
    }
    if (filters.kapal_id && filters.kapal_id.length > 0) {
      whereConditions.push(`p.kapal_id IN (${filters.kapal_id.map(() => '?').join(',')})`);
      params.push(...filters.kapal_id);
    }
    if (filters.pelabuhan_asal_id && filters.pelabuhan_asal_id.length > 0) {
      whereConditions.push(`p.pelabuhan_asal_id IN (${filters.pelabuhan_asal_id.map(() => '?').join(',')})`);
      params.push(...filters.pelabuhan_asal_id);
    }
    if (filters.rute_id && filters.rute_id.length > 0) {
      whereConditions.push(`p.rute_id IN (${filters.rute_id.map(() => '?').join(',')})`);
      params.push(...filters.rute_id);
    }
    if (filters.shift && filters.shift.length > 0) {
      whereConditions.push(`p.shift IN (${filters.shift.map(() => '?').join(',')})`);
      params.push(...filters.shift);
    }
    if (filters.regu && filters.regu.length > 0) {
      whereConditions.push(`p.regu IN (${filters.regu.map(() => '?').join(',')})`);
      params.push(...filters.regu);
    }
    if (filters.tanggal_dari) {
      whereConditions.push('p.tanggal_produksi >= ?');
      params.push(filters.tanggal_dari);
    }
    if (filters.tanggal_sampai) {
      whereConditions.push('p.tanggal_produksi <= ?');
      params.push(filters.tanggal_sampai);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM produksi p ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Build data query
    const sortBy = pagination.sortBy || 'tanggal_produksi';
    const sortDir = pagination.sortDir || 'desc';
    const sortOrder = sortDir === 'asc' ? 'ASC' : 'DESC';

    let dataQuery = `
      SELECT 
        p.*,
        per.nama_perusahaan as perusahaan_nama,
        k.nama_kapal as kapal_nama,
        pel.nama_pelabuhan as pelabuhan_asal_nama,
        r.nama_rute as rute_nama,
        u_created.nama_lengkap as created_by_nama,
        u_created.username as created_by_username,
        u_updated.nama_lengkap as updated_by_nama,
        u_updated.username as updated_by_username
      FROM produksi p
      LEFT JOIN perusahaan per ON p.perusahaan_id = per.perusahaan_id
      LEFT JOIN kapal k ON p.kapal_id = k.kapal_id
      LEFT JOIN pelabuhan pel ON p.pelabuhan_asal_id = pel.pelabuhan_id
      LEFT JOIN rute r ON p.rute_id = r.rute_id
      LEFT JOIN users u_created ON p.created_by = u_created.user_id
      LEFT JOIN users u_updated ON p.updated_by = u_updated.user_id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}, p.created_at DESC
    `;

    // Apply pagination
    if (pagination.limit && pagination.limit > 0) {
      const offset = ((pagination.page || 1) - 1) * pagination.limit;
      dataQuery += ` LIMIT ${pagination.limit} OFFSET ${offset}`;
    }

    const [rows] = await pool.query(dataQuery, params);

    // Format data
    const data = rows.map(row => ({
      ...row,
      perusahaan: { nama_perusahaan: row.perusahaan_nama },
      kapal: { nama_kapal: row.kapal_nama },
      pelabuhan_asal: { nama_pelabuhan: row.pelabuhan_asal_nama },
      rute: { nama_rute: row.rute_nama },
      created_by_user: { nama_lengkap: row.created_by_nama, username: row.created_by_username },
      updated_by_user: { nama_lengkap: row.updated_by_nama, username: row.updated_by_username }
    }));

    return { data, total };
  }

  // Get by ID
  static async getById(produksi_id) {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        u_created.nama_lengkap as created_by_nama,
        u_created.username as created_by_username,
        u_updated.nama_lengkap as updated_by_nama,
        u_updated.username as updated_by_username
      FROM produksi p
      LEFT JOIN users u_created ON p.created_by = u_created.user_id
      LEFT JOIN users u_updated ON p.updated_by = u_updated.user_id
      WHERE p.produksi_id = ?
    `, [produksi_id]);

    if (!rows || rows.length === 0) {
      throw new Error('Produksi tidak ditemukan');
    }

    const row = rows[0];
    return {
      ...row,
      created_by_user: { nama_lengkap: row.created_by_nama, username: row.created_by_username },
      updated_by_user: { nama_lengkap: row.updated_by_nama, username: row.updated_by_username }
    };
  }

  // Create
  static async create(produksi_data, user_id) {
    try {
      const [result] = await pool.query(
        `INSERT INTO produksi (
          perusahaan_id, kapal_id, pelabuhan_asal_id, rute_id,
          nama_perusahaan, nama_kapal, nama_pelabuhan_asal, nama_pelabuhan_tujuan, nama_rute,
          tanggal_produksi, shift, regu,
          created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          produksi_data.perusahaan_id, produksi_data.kapal_id, produksi_data.pelabuhan_asal_id, produksi_data.rute_id,
          produksi_data.nama_perusahaan, produksi_data.nama_kapal, produksi_data.nama_pelabuhan_asal,
          produksi_data.nama_pelabuhan_tujuan, produksi_data.nama_rute,
          produksi_data.tanggal_produksi, produksi_data.shift, produksi_data.regu,
          user_id, user_id
        ]
      );

      const [rows] = await pool.query('SELECT * FROM produksi WHERE produksi_id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Data produksi dengan kombinasi Kapal, Rute, Tanggal, Shift, dan Regu ini sudah ada. Silakan ubah salah satu parameter atau edit data yang sudah ada.');
      }
      throw error;
    }
  }

  // Update
  static async update(produksi_id, produksi_data, user_id) {
    try {
      await pool.query(
        `UPDATE produksi SET
          perusahaan_id = ?, kapal_id = ?, pelabuhan_asal_id = ?, rute_id = ?,
          nama_perusahaan = ?, nama_kapal = ?, nama_pelabuhan_asal = ?, nama_pelabuhan_tujuan = ?, nama_rute = ?,
          tanggal_produksi = ?, shift = ?, regu = ?,
          updated_by = ?
        WHERE produksi_id = ?`,
        [
          produksi_data.perusahaan_id, produksi_data.kapal_id, produksi_data.pelabuhan_asal_id, produksi_data.rute_id,
          produksi_data.nama_perusahaan, produksi_data.nama_kapal, produksi_data.nama_pelabuhan_asal,
          produksi_data.nama_pelabuhan_tujuan, produksi_data.nama_rute,
          produksi_data.tanggal_produksi, produksi_data.shift, produksi_data.regu,
          user_id, produksi_id
        ]
      );

      const [rows] = await pool.query('SELECT * FROM produksi WHERE produksi_id = ?', [produksi_id]);
      return rows[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Data produksi dengan kombinasi Kapal, Rute, Tanggal, Shift, dan Regu ini sudah ada. Silakan ubah salah satu parameter atau edit data yang sudah ada.');
      }
      throw error;
    }
  }

  // Delete
  static async delete(produksi_id) {
    const [rows] = await pool.query('SELECT * FROM produksi WHERE produksi_id = ?', [produksi_id]);
    await pool.query('DELETE FROM produksi WHERE produksi_id = ?', [produksi_id]);
    return rows[0];
  }
}

module.exports = ProduksiModel;

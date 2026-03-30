const pool = require("../config/database");

class TemplateKapalRuteModel {
  // Get all templates
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        tkr.template_id,
        tkr.rute_id,
        r.nama_rute,
        tkr.kapal_id,
        k.nama_kapal,
        k.berat_kapal as gt,
        tkr.urutan,
        p.perusahaan_id,
        p.nama_perusahaan,
        tkr.is_active,
        tkr.created_at,
        tkr.updated_at
      FROM template_kapal_rute tkr
      INNER JOIN rute r ON tkr.rute_id = r.rute_id
      INNER JOIN kapal k ON tkr.kapal_id = k.kapal_id
      LEFT JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE tkr.is_active = true
      ORDER BY tkr.rute_id, tkr.urutan
    `);

    return rows.map((row) => ({
      template_id: row.template_id,
      rute_id: row.rute_id,
      nama_rute: row.nama_rute,
      kapal_id: row.kapal_id,
      nama_kapal: row.nama_kapal,
      gt: row.gt,
      urutan: row.urutan,
      perusahaan_id: row.perusahaan_id,
      nama_perusahaan: row.nama_perusahaan,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  // Get templates by rute_id
  static async getByRute(rute_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        tkr.template_id,
        tkr.rute_id,
        r.nama_rute,
        tkr.kapal_id,
        k.nama_kapal,
        k.berat_kapal as gt,
        tkr.urutan,
        p.perusahaan_id,
        p.nama_perusahaan,
        tkr.is_active,
        tkr.created_at,
        tkr.updated_at
      FROM template_kapal_rute tkr
      INNER JOIN rute r ON tkr.rute_id = r.rute_id
      INNER JOIN kapal k ON tkr.kapal_id = k.kapal_id
      LEFT JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE tkr.rute_id = ? AND tkr.is_active = true
      ORDER BY tkr.urutan
    `,
      [rute_id],
    );

    return rows.map((row) => ({
      template_id: row.template_id,
      rute_id: row.rute_id,
      nama_rute: row.nama_rute,
      kapal_id: row.kapal_id,
      nama_kapal: row.nama_kapal,
      gt: row.gt,
      urutan: row.urutan,
      perusahaan_id: row.perusahaan_id,
      nama_perusahaan: row.nama_perusahaan,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  // Get by ID
  static async getById(template_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        tkr.template_id,
        tkr.rute_id,
        r.nama_rute,
        tkr.kapal_id,
        k.nama_kapal,
        k.berat_kapal as gt,
        tkr.urutan,
        p.perusahaan_id,
        p.nama_perusahaan,
        tkr.is_active,
        tkr.created_at,
        tkr.updated_at
      FROM template_kapal_rute tkr
      INNER JOIN rute r ON tkr.rute_id = r.rute_id
      INNER JOIN kapal k ON tkr.kapal_id = k.kapal_id
      LEFT JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE tkr.template_id = ?
    `,
      [template_id],
    );

    if (!rows || rows.length === 0) {
      throw new Error("Template kapal rute tidak ditemukan");
    }

    const row = rows[0];
    return {
      template_id: row.template_id,
      rute_id: row.rute_id,
      nama_rute: row.nama_rute,
      kapal_id: row.kapal_id,
      nama_kapal: row.nama_kapal,
      gt: row.gt,
      urutan: row.urutan,
      perusahaan_id: row.perusahaan_id,
      nama_perusahaan: row.nama_perusahaan,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Create
  static async create(rute_id, kapal_id, urutan) {
    const [result] = await pool.query(
      "INSERT INTO template_kapal_rute (rute_id, kapal_id, urutan) VALUES (?, ?, ?)",
      [rute_id, kapal_id, urutan],
    );

    return await this.getById(result.insertId);
  }

  // Update
  static async update(template_id, rute_id, kapal_id, urutan) {
    await pool.query(
      "UPDATE template_kapal_rute SET rute_id = ?, kapal_id = ?, urutan = ? WHERE template_id = ?",
      [rute_id, kapal_id, urutan, template_id],
    );

    return await this.getById(template_id);
  }

  // Update urutan
  static async updateUrutan(template_id, urutan) {
    await pool.query(
      "UPDATE template_kapal_rute SET urutan = ? WHERE template_id = ?",
      [urutan, template_id],
    );

    return await this.getById(template_id);
  }

  // Delete (soft delete)
  static async delete(template_id) {
    const template = await this.getById(template_id);

    await pool.query(
      "UPDATE template_kapal_rute SET is_active = false WHERE template_id = ?",
      [template_id],
    );

    return template;
  }

  // Hard delete
  static async hardDelete(template_id) {
    const template = await this.getById(template_id);

    await pool.query("DELETE FROM template_kapal_rute WHERE template_id = ?", [
      template_id,
    ]);

    return template;
  }

  // Bulk update urutan untuk satu rute
  static async bulkUpdateUrutan(rute_id, templates) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const template of templates) {
        await connection.query(
          "UPDATE template_kapal_rute SET urutan = ? WHERE template_id = ? AND rute_id = ?",
          [template.urutan, template.template_id, rute_id],
        );
      }

      await connection.commit();
      return await this.getByRute(rute_id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Bulk create untuk satu rute
  static async bulkCreate(rute_id, kapalList) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "DELETE FROM template_kapal_rute WHERE rute_id = ?",
        [rute_id],
      );

      // Insert template baru
      for (const kapal of kapalList) {
        await connection.query(
          "INSERT INTO template_kapal_rute (rute_id, kapal_id, urutan) VALUES (?, ?, ?)",
          [rute_id, kapal.kapal_id, kapal.urutan],
        );
      }

      await connection.commit();
      return await this.getByRute(rute_id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Check if kapal already exists in rute
  static async isKapalExistsInRute(rute_id, kapal_id, exclude_template_id = null) {
    let query = "SELECT COUNT(*) as count FROM template_kapal_rute WHERE rute_id = ? AND kapal_id = ? AND is_active = true";
    const params = [rute_id, kapal_id];

    if (exclude_template_id) {
      query += " AND template_id != ?";
      params.push(exclude_template_id);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  // Get next urutan for rute
  static async getNextUrutan(rute_id) {
    const [rows] = await pool.query(
      "SELECT COALESCE(MAX(urutan), 0) + 1 as next_urutan FROM template_kapal_rute WHERE rute_id = ?",
      [rute_id],
    );
    return rows[0].next_urutan;
  }

  // Get rute yang memiliki kapal ASDP
  static async getRutesWithAsdpKapal() {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        r.rute_id,
        r.nama_rute,
        r.jarak,
        pa.nama_pelabuhan as pelabuhan_asal,
        pt.nama_pelabuhan as pelabuhan_tujuan
      FROM template_kapal_rute tkr
      INNER JOIN rute r ON tkr.rute_id = r.rute_id
      INNER JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.pelabuhan_id
      INNER JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.pelabuhan_id
      INNER JOIN kapal k ON tkr.kapal_id = k.kapal_id
      INNER JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE tkr.is_active = true
        AND r.is_active = true
        AND p.nama_perusahaan LIKE '%PT ASDP INDONESIA FERRY (PERSERO)%'
      ORDER BY r.nama_rute
    `);

    return rows.map((row) => ({
      rute_id: row.rute_id,
      nama_rute: row.nama_rute,
      jarak: row.jarak,
      pelabuhan_asal: row.pelabuhan_asal,
      pelabuhan_tujuan: row.pelabuhan_tujuan,
    }));
  }

  // Get kapal ASDP untuk rute tertentu
  static async getAsdpKapalByRute(rute_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        tkr.template_id,
        tkr.rute_id,
        tkr.kapal_id,
        k.nama_kapal,
        k.berat_kapal as gt,
        tkr.urutan,
        p.perusahaan_id,
        p.nama_perusahaan
      FROM template_kapal_rute tkr
      INNER JOIN kapal k ON tkr.kapal_id = k.kapal_id
      INNER JOIN perusahaan p ON k.perusahaan_id = p.perusahaan_id
      WHERE tkr.rute_id = ? 
        AND tkr.is_active = true
        AND p.nama_perusahaan LIKE '%PT ASDP INDONESIA FERRY (PERSERO)%'
      ORDER BY tkr.urutan
    `,
      [rute_id],
    );

    return rows.map((row) => ({
      template_id: row.template_id,
      rute_id: row.rute_id,
      kapal_id: row.kapal_id,
      nama_kapal: row.nama_kapal,
      gt: row.gt,
      urutan: row.urutan,
      perusahaan_id: row.perusahaan_id,
      nama_perusahaan: row.nama_perusahaan,
    }));
  }
}

module.exports = TemplateKapalRuteModel;

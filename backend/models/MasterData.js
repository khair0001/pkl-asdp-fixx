const pool = require('../config/database');

class MasterDataModel {
  // Get kategori penumpang
  static async getKategoriPenumpang() {
    const [rows] = await pool.query(
      'SELECT * FROM kategori_penumpang ORDER BY kategori_penumpang_id'
    );
    return rows;
  }

  // Get golongan kendaraan
  static async getGolonganKendaraan() {
    const [rows] = await pool.query(
      'SELECT * FROM golongan_kendaraan ORDER BY nomor_golongan, tipe_muatan'
    );
    return rows;
  }
}

module.exports = MasterDataModel;

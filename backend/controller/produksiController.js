const ProduksiModel = require('../models/Produksi');
const ProduksiPenumpangModel = require('../models/ProduksiPenumpang');
const ProduksiKendaraanModel = require('../models/ProduksiKendaraan');
const PerusahaanModel = require('../models/Perusahaan');
const KapalModel = require('../models/Kapal');
const PelabuhanModel = require('../models/Pelabuhan');
const RuteModel = require('../models/Rute');

class ProduksiController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        perusahaan_id: req.query.perusahaan_id ? req.query.perusahaan_id.split(',').map(Number) : null,
        kapal_id: req.query.kapal_id ? req.query.kapal_id.split(',').map(Number) : null,
        pelabuhan_asal_id: req.query.pelabuhan_asal_id ? req.query.pelabuhan_asal_id.split(',').map(Number) : null,
        rute_id: req.query.rute_id ? req.query.rute_id.split(',').map(Number) : null,
        shift: req.query.shift ? req.query.shift.split(',') : null,
        regu: req.query.regu ? req.query.regu.split(',') : null,
        tanggal_dari: req.query.tanggal_dari,
        tanggal_sampai: req.query.tanggal_sampai
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: req.query.limit !== undefined ? parseInt(req.query.limit) : 10,
        sortBy: req.query.sortBy || 'tanggal_produksi',
        sortDir: req.query.sortDir || 'desc'
      };

      const result = await ProduksiModel.getAll(filters, pagination);
      
      const totalPages = pagination.limit > 0 
        ? Math.ceil(result.total / pagination.limit) 
        : 1;

      res.json({ 
        data: result.data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const produksi = await ProduksiModel.getById(req.params.id);
      const penumpang = await ProduksiPenumpangModel.getByProduksi(req.params.id);
      const kendaraan = await ProduksiKendaraanModel.getByProduksi(req.params.id);

      res.json({
        data: {
          ...produksi,
          penumpang,
          kendaraan
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        perusahaan_id,
        kapal_id,
        pelabuhan_asal_id,
        rute_id,
        tanggal_produksi,
        shift,
        regu,
        penumpang,
        kendaraan
      } = req.body;

      // Validasi
      if (!perusahaan_id || !kapal_id || !pelabuhan_asal_id || !rute_id || !tanggal_produksi || !shift || !regu) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Semua field header harus diisi' });
      }

      // Get snapshot data dari master - PARALLEL
      const [perusahaan, kapal, pelabuhan_asal, rute] = await Promise.all([
        PerusahaanModel.getById(perusahaan_id),
        KapalModel.getById(kapal_id),
        PelabuhanModel.getById(pelabuhan_asal_id),
        RuteModel.getById(rute_id)
      ]);
      
      const pelabuhan_tujuan = await PelabuhanModel.getById(rute.pelabuhan_tujuan_id);

      // Create produksi header
      const produksiData = {
        perusahaan_id,
        kapal_id,
        pelabuhan_asal_id,
        rute_id,
        nama_perusahaan: perusahaan.nama_perusahaan,
        nama_kapal: kapal.nama_kapal,
        nama_pelabuhan_asal: pelabuhan_asal.nama_pelabuhan,
        nama_pelabuhan_tujuan: pelabuhan_tujuan.nama_pelabuhan,
        nama_rute: rute.nama_rute,
        tanggal_produksi,
        shift,
        regu
      };

      const [result] = await connection.query(
        `INSERT INTO produksi (
          perusahaan_id, kapal_id, pelabuhan_asal_id, rute_id,
          nama_perusahaan, nama_kapal, nama_pelabuhan_asal, nama_pelabuhan_tujuan, nama_rute,
          tanggal_produksi, shift, regu,
          created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          produksiData.perusahaan_id, produksiData.kapal_id, produksiData.pelabuhan_asal_id, produksiData.rute_id,
          produksiData.nama_perusahaan, produksiData.nama_kapal, produksiData.nama_pelabuhan_asal,
          produksiData.nama_pelabuhan_tujuan, produksiData.nama_rute,
          produksiData.tanggal_produksi, produksiData.shift, produksiData.regu,
          req.user.user_id, req.user.user_id
        ]
      );

      const produksi_id = result.insertId;

      // Insert penumpang - dalam transaction yang sama
      if (penumpang && penumpang.length > 0) {
        for (const p of penumpang) {
          if (p.jumlah > 0) {
            await connection.query(
              `INSERT INTO produksi_penumpang 
              (produksi_id, kategori_penumpang_id, nama_kategori, jumlah, tarif, subtotal, is_tarif_custom) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [produksi_id, p.kategori_penumpang_id, p.nama_kategori, p.jumlah, p.tarif, p.subtotal, p.is_tarif_custom || false]
            );
          }
        }
      }

      // Insert kendaraan - dalam transaction yang sama
      if (kendaraan && kendaraan.length > 0) {
        for (const k of kendaraan) {
          if (k.jumlah > 0) {
            await connection.query(
              `INSERT INTO produksi_kendaraan 
              (produksi_id, golongan_id, nomor_golongan, tipe_muatan, jumlah, tarif, subtotal, is_tarif_custom) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [produksi_id, k.golongan_id, k.nomor_golongan, k.tipe_muatan, k.jumlah, k.tarif, k.subtotal, k.is_tarif_custom || false]
            );
          }
        }
      }

      // Commit transaction - trigger akan berjalan setelah commit
      await connection.commit();
      connection.release();

      // Get complete data
      const resultData = await ProduksiModel.getById(produksi_id);
      res.status(201).json({ message: 'Produksi berhasil disimpan', data: resultData });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('[CREATE] Fatal error:', error);
      next(error);
    }
  }

  static async update(req, res, next) {
    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        perusahaan_id,
        kapal_id,
        pelabuhan_asal_id,
        rute_id,
        tanggal_produksi,
        shift,
        regu,
        penumpang,
        kendaraan
      } = req.body;

      // Get snapshot data dari master - PARALLEL
      const [perusahaan, kapal, pelabuhan_asal, rute] = await Promise.all([
        PerusahaanModel.getById(perusahaan_id),
        KapalModel.getById(kapal_id),
        PelabuhanModel.getById(pelabuhan_asal_id),
        RuteModel.getById(rute_id)
      ]);
      
      const pelabuhan_tujuan = await PelabuhanModel.getById(rute.pelabuhan_tujuan_id);

      // Update produksi header
      await connection.query(
        `UPDATE produksi SET
          perusahaan_id = ?, kapal_id = ?, pelabuhan_asal_id = ?, rute_id = ?,
          nama_perusahaan = ?, nama_kapal = ?, nama_pelabuhan_asal = ?, nama_pelabuhan_tujuan = ?, nama_rute = ?,
          tanggal_produksi = ?, shift = ?, regu = ?,
          updated_by = ?
        WHERE produksi_id = ?`,
        [
          perusahaan_id, kapal_id, pelabuhan_asal_id, rute_id,
          perusahaan.nama_perusahaan, kapal.nama_kapal, pelabuhan_asal.nama_pelabuhan,
          pelabuhan_tujuan.nama_pelabuhan, rute.nama_rute,
          tanggal_produksi, shift, regu,
          req.user.user_id, req.params.id
        ]
      );

      // Delete existing details
      await connection.query('DELETE FROM produksi_penumpang WHERE produksi_id = ?', [req.params.id]);
      await connection.query('DELETE FROM produksi_kendaraan WHERE produksi_id = ?', [req.params.id]);

      // Insert new penumpang
      if (penumpang && penumpang.length > 0) {
        for (const p of penumpang) {
          if (p.jumlah > 0) {
            await connection.query(
              `INSERT INTO produksi_penumpang 
              (produksi_id, kategori_penumpang_id, nama_kategori, jumlah, tarif, subtotal, is_tarif_custom) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [req.params.id, p.kategori_penumpang_id, p.nama_kategori, p.jumlah, p.tarif, p.subtotal, p.is_tarif_custom || false]
            );
          }
        }
      }

      // Insert new kendaraan
      if (kendaraan && kendaraan.length > 0) {
        for (const k of kendaraan) {
          if (k.jumlah > 0) {
            await connection.query(
              `INSERT INTO produksi_kendaraan 
              (produksi_id, golongan_id, nomor_golongan, tipe_muatan, jumlah, tarif, subtotal, is_tarif_custom) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [req.params.id, k.golongan_id, k.nomor_golongan, k.tipe_muatan, k.jumlah, k.tarif, k.subtotal, k.is_tarif_custom || false]
            );
          }
        }
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      const result = await ProduksiModel.getById(req.params.id);
      res.json({ message: 'Produksi berhasil diupdate', data: result });
    } catch (error) {
      await connection.rollback();
      connection.release();
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await ProduksiModel.delete(req.params.id);
      res.json({ message: 'Produksi berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProduksiController;

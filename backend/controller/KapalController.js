const KapalModel = require('../models/Kapal');

class KapalController {
  static async getAll(req, res, next) {
    try {
      const data = await KapalModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await KapalModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getByPerusahaan(req, res, next) {
    try {
      const data = await KapalModel.getByPerusahaan(req.params.perusahaan_id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan } = req.body;
      
      if (!perusahaan_id || !nama_kapal) {
        return res.status(400).json({ error: 'Perusahaan dan nama kapal harus diisi' });
      }

      const data = await KapalModel.create(perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan);
      res.status(201).json({ message: 'Kapal berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan } = req.body;
      
      if (!perusahaan_id || !nama_kapal) {
        return res.status(400).json({ error: 'Perusahaan dan nama kapal harus diisi' });
      }

      const data = await KapalModel.update(req.params.id, perusahaan_id, nama_kapal, berat_kapal, kapasitas_penumpang, kapasitas_kendaraan);
      res.json({ message: 'Kapal berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await KapalModel.delete(req.params.id);
      res.json({ message: 'Kapal berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = KapalController;

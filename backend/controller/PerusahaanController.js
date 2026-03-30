const PerusahaanModel = require('../models/Perusahaan');

class PerusahaanController {
  static async getAll(req, res, next) {
    try {
      const data = await PerusahaanModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await PerusahaanModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { nama_perusahaan } = req.body;
      
      if (!nama_perusahaan) {
        return res.status(400).json({ error: 'Nama perusahaan harus diisi' });
      }

      const data = await PerusahaanModel.create(nama_perusahaan);
      res.status(201).json({ message: 'Perusahaan berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { nama_perusahaan } = req.body;
      
      if (!nama_perusahaan) {
        return res.status(400).json({ error: 'Nama perusahaan harus diisi' });
      }

      const data = await PerusahaanModel.update(req.params.id, nama_perusahaan);
      res.json({ message: 'Perusahaan berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await PerusahaanModel.delete(req.params.id);
      res.json({ message: 'Perusahaan berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PerusahaanController;

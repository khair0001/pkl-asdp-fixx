const PelabuhanModel = require('../models/Pelabuhan');

class PelabuhanController {
  static async getAll(req, res, next) {
    try {
      const data = await PelabuhanModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await PelabuhanModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { nama_pelabuhan, lokasi } = req.body;
      
      if (!nama_pelabuhan) {
        return res.status(400).json({ error: 'Nama pelabuhan harus diisi' });
      }

      const data = await PelabuhanModel.create(nama_pelabuhan, lokasi);
      res.status(201).json({ message: 'Pelabuhan berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { nama_pelabuhan, lokasi } = req.body;
      
      if (!nama_pelabuhan) {
        return res.status(400).json({ error: 'Nama pelabuhan harus diisi' });
      }

      const data = await PelabuhanModel.update(req.params.id, nama_pelabuhan, lokasi);
      res.json({ message: 'Pelabuhan berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await PelabuhanModel.delete(req.params.id);
      res.json({ message: 'Pelabuhan berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PelabuhanController;

const RuteModel = require('../models/Rute');

class RuteController {
  static async getAll(req, res, next) {
    try {
      const data = await RuteModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await RuteModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getByPelabuhanAsal(req, res, next) {
    try {
      const data = await RuteModel.getByPelabuhanAsal(req.params.pelabuhan_asal_id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak } = req.body;
      
      if (!pelabuhan_asal_id || !pelabuhan_tujuan_id || !nama_rute) {
        return res.status(400).json({ error: 'Pelabuhan asal, tujuan, dan nama rute harus diisi' });
      }

      const data = await RuteModel.create(pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak);
      res.status(201).json({ message: 'Rute berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak } = req.body;
      
      if (!pelabuhan_asal_id || !pelabuhan_tujuan_id || !nama_rute) {
        return res.status(400).json({ error: 'Pelabuhan asal, tujuan, dan nama rute harus diisi' });
      }

      const data = await RuteModel.update(req.params.id, pelabuhan_asal_id, pelabuhan_tujuan_id, nama_rute, jarak);
      res.json({ message: 'Rute berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await RuteModel.delete(req.params.id);
      res.json({ message: 'Rute berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RuteController;

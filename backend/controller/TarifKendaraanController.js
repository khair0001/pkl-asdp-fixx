const TarifKendaraanModel = require('../models/TarifKendaraan');

class TarifKendaraanController {
  static async getAll(req, res, next) {
    try {
      const data = await TarifKendaraanModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await TarifKendaraanModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getByRute(req, res, next) {
    try {
      const data = await TarifKendaraanModel.getByRute(req.params.rute_id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { rute_id, golongan_id, tarif } = req.body;
      
      if (!rute_id || !golongan_id || !tarif) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
      }

      const data = await TarifKendaraanModel.create(rute_id, golongan_id, tarif);
      res.status(201).json({ message: 'Tarif kendaraan berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { rute_id, golongan_id, tarif } = req.body;
      
      if (!rute_id || !golongan_id || !tarif) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
      }

      const data = await TarifKendaraanModel.update(req.params.id, rute_id, golongan_id, tarif);
      res.json({ message: 'Tarif kendaraan berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await TarifKendaraanModel.delete(req.params.id);
      res.json({ message: 'Tarif kendaraan berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TarifKendaraanController;

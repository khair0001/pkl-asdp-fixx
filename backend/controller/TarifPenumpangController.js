const TarifPenumpangModel = require('../models/TarifPenumpang');

class TarifPenumpangController {
  static async getAll(req, res, next) {
    try {
      const data = await TarifPenumpangModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await TarifPenumpangModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getByRute(req, res, next) {
    try {
      const data = await TarifPenumpangModel.getByRute(req.params.rute_id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { rute_id, kategori_penumpang_id, tarif } = req.body;
      
      if (!rute_id || !kategori_penumpang_id || !tarif) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
      }

      const data = await TarifPenumpangModel.create(rute_id, kategori_penumpang_id, tarif);
      res.status(201).json({ message: 'Tarif penumpang berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { rute_id, kategori_penumpang_id, tarif } = req.body;
      
      if (!rute_id || !kategori_penumpang_id || !tarif) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
      }

      const data = await TarifPenumpangModel.update(req.params.id, rute_id, kategori_penumpang_id, tarif);
      res.json({ message: 'Tarif penumpang berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await TarifPenumpangModel.delete(req.params.id);
      res.json({ message: 'Tarif penumpang berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TarifPenumpangController;

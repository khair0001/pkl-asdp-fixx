const SuratDokumenModel = require('../models/SuratDokumen');

class SuratDokumenController {
  static async getAll(req, res, next) {
    try {
      const data = await SuratDokumenModel.getAll();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req, res, next) {
    try {
      const data = await SuratDokumenModel.getActive();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await SuratDokumenModel.getById(req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { no_dokumen, revisi, halaman, general_manager, manager_usaha } = req.body;

      const data = await SuratDokumenModel.create(
        no_dokumen,
        revisi,
        halaman,
        general_manager,
        manager_usaha
      );
      res.status(201).json({ message: 'Data surat dokumen berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { no_dokumen, revisi, halaman, general_manager, manager_usaha } = req.body;

      const data = await SuratDokumenModel.update(
        req.params.id,
        no_dokumen,
        revisi,
        halaman,
        general_manager,
        manager_usaha
      );
      res.json({ message: 'Data surat dokumen berhasil diupdate', data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const data = await SuratDokumenModel.delete(req.params.id);
      res.json({ message: 'Data surat dokumen berhasil dihapus', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SuratDokumenController;

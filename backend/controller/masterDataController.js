const MasterDataModel = require('../models/MasterData');

class MasterDataController {
  static async getKategoriPenumpang(req, res, next) {
    try {
      const data = await MasterDataModel.getKategoriPenumpang();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getGolonganKendaraan(req, res, next) {
    try {
      const data = await MasterDataModel.getGolonganKendaraan();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MasterDataController;

const TemplateKapalRuteModel = require("../models/TemplateKapalRute");

class TemplateKapalRuteController {
  // Get all templates
  static async getAll(req, res, next) {
    try {
      const templates = await TemplateKapalRuteModel.getAll();
      res.json(templates);
    } catch (error) {
      next(error);
    }
  }

  // Get templates by rute
  static async getByRute(req, res, next) {
    try {
      const { rute_id } = req.params;
      const templates = await TemplateKapalRuteModel.getByRute(rute_id);
      res.json(templates);
    } catch (error) {
      next(error);
    }
  }

  // Get by ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const template = await TemplateKapalRuteModel.getById(id);
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  // Create
  static async create(req, res, next) {
    try {
      const { rute_id, kapal_id, urutan } = req.body;

      // Validasi
      if (!rute_id || !kapal_id) {
        return res.status(400).json({
          error: "Rute dan kapal harus diisi",
        });
      }

      // Check if kapal already exists in rute
      const exists = await TemplateKapalRuteModel.isKapalExistsInRute(
        rute_id,
        kapal_id,
      );
      if (exists) {
        return res.status(400).json({
          error: "Kapal sudah ada dalam template rute ini",
        });
      }

      // Get next urutan if not provided
      let finalUrutan = urutan;
      if (!finalUrutan) {
        finalUrutan = await TemplateKapalRuteModel.getNextUrutan(rute_id);
      }

      const template = await TemplateKapalRuteModel.create(
        rute_id,
        kapal_id,
        finalUrutan,
      );
      res.status(201).json(template);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error: "Kapal sudah ada dalam template rute ini atau urutan sudah digunakan",
        });
      }
      next(error);
    }
  }

  // Update
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { rute_id, kapal_id, urutan } = req.body;

      // Validasi
      if (!rute_id || !kapal_id || !urutan) {
        return res.status(400).json({
          error: "Rute, kapal, dan urutan harus diisi",
        });
      }

      // Check if kapal already exists in rute (exclude current template)
      const exists = await TemplateKapalRuteModel.isKapalExistsInRute(
        rute_id,
        kapal_id,
        id,
      );
      if (exists) {
        return res.status(400).json({
          error: "Kapal sudah ada dalam template rute ini",
        });
      }

      const template = await TemplateKapalRuteModel.update(
        id,
        rute_id,
        kapal_id,
        urutan,
      );
      res.json(template);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error: "Kapal sudah ada dalam template rute ini atau urutan sudah digunakan",
        });
      }
      next(error);
    }
  }

  // Update urutan only
  static async updateUrutan(req, res, next) {
    try {
      const { id } = req.params;
      const { urutan } = req.body;

      if (!urutan) {
        return res.status(400).json({
          error: "Urutan harus diisi",
        });
      }

      const template = await TemplateKapalRuteModel.updateUrutan(id, urutan);
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  // Delete
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const template = await TemplateKapalRuteModel.hardDelete(id);
      res.json({
        message: "Template kapal rute berhasil dihapus",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk update urutan
  static async bulkUpdateUrutan(req, res, next) {
    try {
      const { rute_id } = req.params;
      const { templates } = req.body;

      if (!templates || !Array.isArray(templates)) {
        return res.status(400).json({
          error: "Data templates harus berupa array",
        });
      }

      const result = await TemplateKapalRuteModel.bulkUpdateUrutan(
        rute_id,
        templates,
      );
      res.json({
        message: "Urutan template berhasil diupdate",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk create/replace templates for a rute
  static async bulkCreate(req, res, next) {
    try {
      const { rute_id } = req.params;
      const { kapal_list } = req.body;

      if (!kapal_list || !Array.isArray(kapal_list)) {
        return res.status(400).json({
          error: "Data kapal_list harus berupa array",
        });
      }

      // Validasi setiap item
      for (const item of kapal_list) {
        if (!item.kapal_id || !item.urutan) {
          return res.status(400).json({
            error: "Setiap item harus memiliki kapal_id dan urutan",
          });
        }
      }

      const result = await TemplateKapalRuteModel.bulkCreate(
        rute_id,
        kapal_list,
      );
      res.json({
        message: "Template kapal rute berhasil disimpan",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get rute yang memiliki kapal ASDP
  static async getRutesWithAsdpKapal(req, res, next) {
    try {
      const rutes = await TemplateKapalRuteModel.getRutesWithAsdpKapal();
      res.json({
        success: true,
        data: rutes,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get kapal ASDP untuk rute tertentu
  static async getAsdpKapalByRute(req, res, next) {
    try {
      const { rute_id } = req.params;
      const kapal = await TemplateKapalRuteModel.getAsdpKapalByRute(rute_id);
      res.json({
        success: true,
        data: kapal,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TemplateKapalRuteController;

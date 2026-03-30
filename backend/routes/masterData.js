const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const PerusahaanController = require('../controller/PerusahaanController');
const KapalController = require('../controller/KapalController');
const PelabuhanController = require('../controller/PelabuhanController');
const RuteController = require('../controller/RuteController');
const MasterDataController = require('../controller/masterDataController');
const TarifPenumpangController = require('../controller/TarifPenumpangController');
const TarifKendaraanController = require('../controller/TarifKendaraanController');
const TemplateKapalRuteController = require('../controller/TemplateKapalRuteController');
const SuratDokumenController = require('../controller/SuratDokumenController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Perusahaan routes
router.get('/perusahaan', PerusahaanController.getAll);
router.get('/perusahaan/:id', PerusahaanController.getById);
router.post('/perusahaan', PerusahaanController.create);
router.put('/perusahaan/:id', PerusahaanController.update);
router.delete('/perusahaan/:id', PerusahaanController.delete);

// Kapal routes
router.get('/kapal', KapalController.getAll);
router.get('/kapal/:id', KapalController.getById);
router.get('/kapal/perusahaan/:perusahaan_id', KapalController.getByPerusahaan);
router.post('/kapal', KapalController.create);
router.put('/kapal/:id', KapalController.update);
router.delete('/kapal/:id', KapalController.delete);

// Pelabuhan routes
router.get('/pelabuhan', PelabuhanController.getAll);
router.get('/pelabuhan/:id', PelabuhanController.getById);
router.post('/pelabuhan', PelabuhanController.create);
router.put('/pelabuhan/:id', PelabuhanController.update);
router.delete('/pelabuhan/:id', PelabuhanController.delete);

// Rute routes
router.get('/rute', RuteController.getAll);
router.get('/rute/:id', RuteController.getById);
router.get('/rute/pelabuhan-asal/:pelabuhan_asal_id', RuteController.getByPelabuhanAsal);
router.post('/rute', RuteController.create);
router.put('/rute/:id', RuteController.update);
router.delete('/rute/:id', RuteController.delete);

// Master data (kategori & golongan)
router.get('/kategori-penumpang', MasterDataController.getKategoriPenumpang);
router.get('/golongan-kendaraan', MasterDataController.getGolonganKendaraan);

// Tarif Penumpang routes
router.get('/tarif-penumpang', TarifPenumpangController.getAll);
router.get('/tarif-penumpang/:id', TarifPenumpangController.getById);
router.get('/tarif-penumpang/rute/:rute_id', TarifPenumpangController.getByRute);
router.post('/tarif-penumpang', TarifPenumpangController.create);
router.put('/tarif-penumpang/:id', TarifPenumpangController.update);
router.delete('/tarif-penumpang/:id', TarifPenumpangController.delete);

// Tarif Kendaraan routes
router.get('/tarif-kendaraan', TarifKendaraanController.getAll);
router.get('/tarif-kendaraan/:id', TarifKendaraanController.getById);
router.get('/tarif-kendaraan/rute/:rute_id', TarifKendaraanController.getByRute);
router.post('/tarif-kendaraan', TarifKendaraanController.create);
router.put('/tarif-kendaraan/:id', TarifKendaraanController.update);
router.delete('/tarif-kendaraan/:id', TarifKendaraanController.delete);

// Template Kapal Rute routes
router.get('/template-kapal-rute', TemplateKapalRuteController.getAll);
router.get('/template-kapal-rute/rutes-with-asdp', TemplateKapalRuteController.getRutesWithAsdpKapal);
router.get('/template-kapal-rute/asdp-kapal/:rute_id', TemplateKapalRuteController.getAsdpKapalByRute);
router.get('/template-kapal-rute/:id', TemplateKapalRuteController.getById);
router.get('/template-kapal-rute/rute/:rute_id', TemplateKapalRuteController.getByRute);
router.post('/template-kapal-rute', TemplateKapalRuteController.create);
router.put('/template-kapal-rute/:id', TemplateKapalRuteController.update);
router.put('/template-kapal-rute/:id/urutan', TemplateKapalRuteController.updateUrutan);
router.delete('/template-kapal-rute/:id', TemplateKapalRuteController.delete);
router.post('/template-kapal-rute/rute/:rute_id/bulk-update-urutan', TemplateKapalRuteController.bulkUpdateUrutan);
router.post('/template-kapal-rute/rute/:rute_id/bulk-create', TemplateKapalRuteController.bulkCreate);

// Surat Dokumen routes
router.get('/surat-dokumen', SuratDokumenController.getAll);
router.get('/surat-dokumen/active', SuratDokumenController.getActive);
router.get('/surat-dokumen/:id', SuratDokumenController.getById);
router.post('/surat-dokumen', SuratDokumenController.create);
router.put('/surat-dokumen/:id', SuratDokumenController.update);
router.delete('/surat-dokumen/:id', SuratDokumenController.delete);

module.exports = router;

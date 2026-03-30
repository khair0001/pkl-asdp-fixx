const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ProduksiController = require('../controller/produksiController');
const ProduksiExportController = require('../services/produksiExportController');
const LaporanKinerjaAsdpController = require('../services/laporanKinerjaAsdpController');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/export/kinerja-asdp', LaporanKinerjaAsdpController.exportKinerjaAsdp);
router.get('/export/excel', ProduksiExportController.exportExcel);
router.get('/', ProduksiController.getAll);
router.get('/:id', ProduksiController.getById);
router.post('/', ProduksiController.create);
router.put('/:id', ProduksiController.update);
router.delete('/:id', ProduksiController.delete);

module.exports = router;

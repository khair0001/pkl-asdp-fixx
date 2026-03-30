const ProduksiModel = require("../models/Produksi");
const ProduksiPenumpangModel = require("../models/ProduksiPenumpang");
const ProduksiKendaraanModel = require("../models/ProduksiKendaraan");
const RuteModel = require("../models/Rute");
const KapalModel = require("../models/Kapal");
const TarifKendaraanModel = require("../models/TarifKendaraan");
const TarifPenumpangModel = require("../models/TarifPenumpang");
const TemplateKapalRuteModel = require("../models/TemplateKapalRute");
const ExcelJS = require("exceljs");

// Fungsi untuk mengambil template kapal dari database
const getTemplateKapal = async (ruteId) => {
  try {
    const templatesFromDb = await TemplateKapalRuteModel.getByRute(ruteId);
    
    if (templatesFromDb && templatesFromDb.length > 0) {
      console.log(`Using template from database for rute ${ruteId}: ${templatesFromDb.length} kapal`);
      return templatesFromDb.map((t) => ({
        no: t.urutan,
        nama: t.nama_kapal,
        gt: t.gt || 0,
        perusahaan: t.nama_perusahaan || "",
      }));
    }

    console.warn(`No template found in database for rute ${ruteId}`);
    return [];
  } catch (error) {
    console.error("Error getting template kapal:", error);
    return [];
  }
};

class ProduksiExportController {
  static async exportExcel(req, res, next) {
    try {
      console.log('=== EXPORT EXCEL START ===');
      console.log('Query params:', req.query);

      // Validasi: rute_id wajib diisi
      if (!req.query.rute_id) {
        return res.status(400).json({ error: "Pilih rute terlebih dahulu sebelum mengekspor data." });
      }

      // Validasi: periode wajib diisi
      if (!req.query.tanggal_dari || !req.query.tanggal_sampai) {
        return res.status(400).json({ error: "Pilih periode (tanggal dari dan tanggal sampai) terlebih dahulu sebelum mengekspor data." });
      }

      const filters = {
        perusahaan_id:    req.query.perusahaan_id    ? req.query.perusahaan_id.split(",").map(Number)    : null,
        kapal_id:         req.query.kapal_id         ? req.query.kapal_id.split(",").map(Number)         : null,
        pelabuhan_asal_id:req.query.pelabuhan_asal_id? req.query.pelabuhan_asal_id.split(",").map(Number): null,
        rute_id:          req.query.rute_id          ? req.query.rute_id.split(",").map(Number)          : null,
        shift:            req.query.shift            ? req.query.shift.split(",")                        : null,
        regu:             req.query.regu             ? req.query.regu.split(",")                         : null,
        tanggal_dari:     req.query.tanggal_dari,
        tanggal_sampai:   req.query.tanggal_sampai,
      };

      const produksiResult = await ProduksiModel.getAll(filters);
      const produksiList = produksiResult.data || [];
      console.log('Produksi list count:', produksiList.length);
      
      if (produksiList.length === 0) {
        return res.status(404).json({ error: "Tidak ada data untuk diekspor" });
      }

      console.log('Fetching details for produksi items...');
      const dataWithDetails = await Promise.all(
        produksiList.map(async (p) => {
          const penumpang = await ProduksiPenumpangModel.getByProduksi(p.produksi_id);
          const kendaraan = await ProduksiKendaraanModel.getByProduksi(p.produksi_id);
          return { ...p, penumpang, kendaraan };
        }),
      );
      console.log('Details fetched successfully');

      // Get kapal data (GT)
      console.log('Fetching kapal data...');
      const kapalIds = [...new Set(dataWithDetails.map(p => p.kapal_id))];
      const kapalData = {};
      for (const kapal_id of kapalIds) {
        try { 
          kapalData[kapal_id] = await KapalModel.getById(kapal_id); 
          console.log(`Kapal ${kapal_id}:`, kapalData[kapal_id]?.nama_kapal);
        }
        catch (err) { 
          console.warn(`Failed to get kapal ${kapal_id}:`, err.message);
          kapalData[kapal_id] = { berat_kapal: 0 }; 
        }
      }
      console.log('Kapal data fetched');

      // Kumpulkan info rute & pisahkan data per rute
      const ruteInfoMap = {};
      const dataPerRute = {};
      dataWithDetails.forEach(item => {
        if (!ruteInfoMap[item.rute_id]) {
          ruteInfoMap[item.rute_id] = {
            rute_id: item.rute_id,
            nama_rute: item.nama_rute || `Rute ${item.rute_id}`,
            nama_pelabuhan_asal: item.nama_pelabuhan_asal || '-',
          };
        }
        if (!dataPerRute[item.rute_id]) dataPerRute[item.rute_id] = [];
        dataPerRute[item.rute_id].push(item);
      });

      const ruteIdsInData = [...new Set(dataWithDetails.map(p => p.rute_id))];
      const periodeAwal  = filters.tanggal_dari  || "-";
      const periodeAkhir = filters.tanggal_sampai || "-";

      // ===================== BUILD EXCEL =====================
      const workbook = new ExcelJS.Workbook();
      const GOLONGAN_STANDAR = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const ROMAWI = { 1:'I', 2:'II', 3:'III', 4:'IV', 5:'V', 6:'VI', 7:'VII', 8:'VIII', 9:'IX' };
      const toRomawi = (n) => ROMAWI[n] || String(n);

      const getColumnLetter = (colNumber) => {
        let letter = '';
        while (colNumber > 0) {
          const remainder = (colNumber - 1) % 26;
          letter = String.fromCharCode(65 + remainder) + letter;
          colNumber = Math.floor((colNumber - 1) / 26);
        }
        return letter;
      };

      // ===================== DETEKSI RUTE BOLAK-BALIK =====================
      // Cek apakah ada rute "Lembar - Padangbai" dan "Padangbai - Lembar"
      const ruteLembarPadangbai = Object.values(ruteInfoMap).find(r => 
        r.nama_rute && r.nama_rute.trim().toLowerCase() === "lembar - padangbai"
      );
      const rutePadangbaiLembar = Object.values(ruteInfoMap).find(r => 
        r.nama_rute && r.nama_rute.trim().toLowerCase() === "padangbai - lembar"
      );
      
      const shouldCreateCombinedSheet = ruteLembarPadangbai && rutePadangbaiLembar;
      
      // Urutkan rute: gabungan dulu, lalu individual
      let orderedRuteIds = [];
      if (shouldCreateCombinedSheet) {
        // Tambahkan marker untuk sheet gabungan
        orderedRuteIds.push('COMBINED_LEMBAR_PADANGBAI');
        // Tambahkan rute individual
        orderedRuteIds.push(ruteLembarPadangbai.rute_id);
        orderedRuteIds.push(rutePadangbaiLembar.rute_id);
        // Tambahkan rute lainnya
        ruteIdsInData.forEach(id => {
          if (id !== ruteLembarPadangbai.rute_id && id !== rutePadangbaiLembar.rute_id) {
            orderedRuteIds.push(id);
          }
        });
      } else {
        orderedRuteIds = [...ruteIdsInData];
      }

      // ===================== LOOP PER RUTE =====================
      for (const ruteId of orderedRuteIds) {
        // Tentukan variabel berdasarkan jenis sheet
        let ruteInfo, ruteData, namaRute, sheetDisplayName;
        
        if (ruteId === 'COMBINED_LEMBAR_PADANGBAI') {
          console.log(`\n=== Processing COMBINED SHEET: Lembar ↔ Padangbai ===`);
          
          // Gabungkan data dari kedua rute
          ruteData = [
            ...(dataPerRute[ruteLembarPadangbai.rute_id] || []),
            ...(dataPerRute[rutePadangbaiLembar.rute_id] || [])
          ];
          
          namaRute = "Lembar - Padangbai"; // Gunakan template yang sama
          ruteInfo = ruteLembarPadangbai; // Gunakan info dari rute pertama
          sheetDisplayName = "Lembar ↔ Padangbai";
          
          console.log(`Combined data count: ${ruteData.length}`);
        } else {
          // Handle rute individual
          console.log(`\n=== Processing rute ${ruteId} ===`);
          ruteInfo  = ruteInfoMap[ruteId];
          ruteData  = dataPerRute[ruteId] || [];
          namaRute  = ruteInfo.nama_rute;
          sheetDisplayName = namaRute;
          console.log(`Rute name: ${namaRute}, data count: ${ruteData.length}`);
        }

        // ---- Get template kapal ----
        let templateKapal = await getTemplateKapal(
          ruteId === 'COMBINED_LEMBAR_PADANGBAI' ? ruteLembarPadangbai.rute_id : ruteId,
          namaRute
        );
        if (templateKapal.length === 0) {
          console.warn(`Skip rute "${namaRute}" — tidak ada template kapal.`);
          continue;
        }
        console.log(`Template kapal count: ${templateKapal.length}`);

        // ---- Detect custom tarif ----
        let hasCustomDws = false, hasCustomBayi = false;
        ruteData.forEach(item => {
          item.penumpang.forEach(p => {
            const kat = String(p.nama_kategori || '').toLowerCase();
            if (p.is_tarif_custom) {
              if (kat.includes('dewasa')) hasCustomDws = true;
              if (kat.includes('bayi'))   hasCustomBayi = true;
            }
          });
        });

        // ---- Collect golongan ----
        const golonganSet = new Set();
        const golonganCustomSet = new Set();
        const golonganTipeMuatan = {};
        ruteData.forEach(item => {
          item.kendaraan.forEach(k => {
            golonganSet.add(k.golongan_id);
            if (k.is_tarif_custom) golonganCustomSet.add(k.golongan_id);
            if (!golonganTipeMuatan[k.golongan_id] && k.tipe_muatan)
              golonganTipeMuatan[k.golongan_id] = String(k.tipe_muatan).toLowerCase();
          });
        });

        // ---- Build tarifData ----
        const GOLONGAN_PNP_BRG_MAP = {};
        let tarifData = [];
        try {
          console.log('Fetching tarif data...');
          // Untuk sheet gabungan, gunakan rute_id dari rute pertama (Lembar - Padangbai)
          const tarifRuteId = ruteId === 'COMBINED_LEMBAR_PADANGBAI' ? ruteLembarPadangbai.rute_id : ruteId;
          const allTarif = await TarifKendaraanModel.getByRute(tarifRuteId);
          console.log(`Found ${allTarif.length} tarif records`);
          const tarifStandar  = [];
          const tarifTambahan = [];
          allTarif.forEach(t => {
            const n = parseInt(t.golongan?.nomor_golongan || 0);
            if (GOLONGAN_STANDAR.includes(n)) tarifStandar.push(t);
            else if (golonganSet.has(t.golongan_id)) tarifTambahan.push(t);
          });
          const nomorAda = new Set(tarifStandar.map(t => parseInt(t.golongan?.nomor_golongan || 0)));
          GOLONGAN_STANDAR.forEach(n => {
            if (!nomorAda.has(n)) tarifStandar.push({ golongan_id: `standar_${n}`, tarif: 0, golongan: { nomor_golongan: n } });
          });
          tarifStandar.sort((a, b)  => parseInt(a.golongan?.nomor_golongan || 0) - parseInt(b.golongan?.nomor_golongan || 0));
          tarifTambahan.sort((a, b) => parseInt(a.golongan?.nomor_golongan || 0) - parseInt(b.golongan?.nomor_golongan || 0));
          tarifData = [...tarifStandar, ...tarifTambahan];
        } catch (e) { 
          console.error('Error getting tarif:', e); 
        }

        if (tarifData.length === 0)
          tarifData = GOLONGAN_STANDAR.map(n => ({ golongan_id: `standar_${n}`, tarif: 0, golongan: { nomor_golongan: n } }));

        tarifData = tarifData.map(t => {
          const sampleCustom = ruteData.flatMap(d => d.kendaraan).find(k => k.golongan_id === t.golongan_id && k.is_tarif_custom);
          return { ...t, hasCustom: golonganCustomSet.has(t.golongan_id), tarif_custom: sampleCustom?.tarif || null, tipe_muatan: golonganTipeMuatan[t.golongan_id] || t.golongan?.tipe_muatan || null };
        });

        // Build PNP_BRG_MAP
        tarifData.forEach(t => {
          const nomor = parseInt(t.golongan?.nomor_golongan || 0);
          const tipe  = String(t.tipe_muatan || '').toLowerCase();
          if (!tipe) return;
          if (!GOLONGAN_PNP_BRG_MAP[nomor]) GOLONGAN_PNP_BRG_MAP[nomor] = {};
          if (tipe.includes('barang')) {
            GOLONGAN_PNP_BRG_MAP[nomor].brg_id = t.golongan_id;
            GOLONGAN_PNP_BRG_MAP[nomor].brg_tarif = t.tarif;
            GOLONGAN_PNP_BRG_MAP[nomor].brg_tarif_custom = t.tarif_custom;
            GOLONGAN_PNP_BRG_MAP[nomor].brg_hasCustom = t.hasCustom;
          } else {
            GOLONGAN_PNP_BRG_MAP[nomor].pnp_id = t.golongan_id;
            GOLONGAN_PNP_BRG_MAP[nomor].pnp_tarif = t.tarif;
            GOLONGAN_PNP_BRG_MAP[nomor].pnp_tarif_custom = t.tarif_custom;
            GOLONGAN_PNP_BRG_MAP[nomor].pnp_hasCustom = t.hasCustom;
          }
        });
        Object.keys(GOLONGAN_PNP_BRG_MAP).forEach(n => {
          const g = GOLONGAN_PNP_BRG_MAP[n];
          if (!g.pnp_id || !g.brg_id) delete GOLONGAN_PNP_BRG_MAP[n];
        });

        // ---- Tarif penumpang ----
        // Ambil tarif dari master data tarif penumpang
        let tarifDwsNormal = 0;
        let tarifDwsCustom = 0;
        let tarifBayiNormal = 0;
        let tarifBayiCustom = 0;

        try {
          // Untuk sheet gabungan, gunakan rute_id dari rute pertama (Lembar - Padangbai)
          const tarifPnpRuteId = ruteId === 'COMBINED_LEMBAR_PADANGBAI' ? ruteLembarPadangbai.rute_id : ruteId;
          const allTarifPenumpang = await TarifPenumpangModel.getByRute(tarifPnpRuteId);

          // Cari tarif dewasa dari master data
          const tarifDewasa = allTarifPenumpang.find(
            (t) =>
              t.kategori?.nama_kategori &&
              String(t.kategori.nama_kategori).toLowerCase().includes("dewasa"),
          );
          if (tarifDewasa) {
            tarifDwsNormal = tarifDewasa.tarif || 0;
          }

          // Cari tarif bayi dari master data
          const tarifBayi = allTarifPenumpang.find(
            (t) =>
              t.kategori?.nama_kategori &&
              String(t.kategori.nama_kategori).toLowerCase().includes("bayi"),
          );
          if (tarifBayi) {
            tarifBayiNormal = tarifBayi.tarif || 0;
          }

          // Cari tarif custom dari data produksi (jika ada)
          const getTarifCustom = (data, kat) => {
            for (const item of data) {
              const found = item.penumpang.find(
                (p) =>
                  String(p.nama_kategori || "")
                    .toLowerCase()
                    .includes(kat) && p.is_tarif_custom,
              );
              if (found) return found.tarif || 0;
            }
            return 0;
          };

          tarifDwsCustom = getTarifCustom(ruteData, "dewasa");
          tarifBayiCustom = getTarifCustom(ruteData, "bayi");
        } catch (e) {
          console.error("Error getting tarif penumpang:", e);
          // Fallback ke metode lama jika gagal
          const getTarifPnp = (data, kat, isCustom) => {
            for (const item of data) {
              const found = item.penumpang.find(
                (p) =>
                  String(p.nama_kategori || "")
                    .toLowerCase()
                    .includes(kat) && !!p.is_tarif_custom === isCustom,
              );
              if (found) return found.tarif || 0;
            }
            return 0;
          };
          tarifDwsNormal = getTarifPnp(ruteData, "dewasa", false);
          tarifDwsCustom = getTarifPnp(ruteData, "dewasa", true);
          tarifBayiNormal = getTarifPnp(ruteData, "bayi", false);
          tarifBayiCustom = getTarifPnp(ruteData, "bayi", true);
        }

        // ---- Group data by kapal ----
        const groupedByKapal = {};
        ruteData.forEach(item => {
          const kid = item.kapal_id;
          if (!groupedByKapal[kid]) {
            groupedByKapal[kid] = {
              kapal_id: kid,
              nama_kapal: item.kapal?.nama_kapal || '',
              nama_perusahaan: item.perusahaan?.nama_perusahaan || '',
              gt: kapalData[kid]?.berat_kapal || 0,
              trips: 0, dws: 0, dwsCustom: 0, bayi: 0, bayiCustom: 0,
              kendaraanByGolongan: {}, kendaraanCustomByGolongan: {},
            };
            tarifData.forEach(t => {
              groupedByKapal[kid].kendaraanByGolongan[t.golongan_id] = 0;
              groupedByKapal[kid].kendaraanCustomByGolongan[t.golongan_id] = 0;
            });
          }
          groupedByKapal[kid].trips++;
          item.penumpang.forEach(p => {
            const kat = String(p.nama_kategori || '').toLowerCase();
            if (kat.includes('dewasa')) {
              if (p.is_tarif_custom) groupedByKapal[kid].dwsCustom += p.jumlah;
              else groupedByKapal[kid].dws += p.jumlah;
            } else if (kat.includes('bayi')) {
              if (p.is_tarif_custom) groupedByKapal[kid].bayiCustom += p.jumlah;
              else groupedByKapal[kid].bayi += p.jumlah;
            }
          });
          item.kendaraan.forEach(k => {
            if (k.is_tarif_custom) {
              if (groupedByKapal[kid].kendaraanCustomByGolongan.hasOwnProperty(k.golongan_id))
                groupedByKapal[kid].kendaraanCustomByGolongan[k.golongan_id] += k.jumlah;
            } else {
              if (groupedByKapal[kid].kendaraanByGolongan.hasOwnProperty(k.golongan_id))
                groupedByKapal[kid].kendaraanByGolongan[k.golongan_id] += k.jumlah;
            }
          });
        });

        // ===================== CREATE WORKSHEET =====================
        console.log('Creating worksheet...');
        const finalSheetName = (sheetDisplayName || namaRute).substring(0, 31);
        const worksheet = workbook.addWorksheet(finalSheetName);
        worksheet.properties.defaultFont = { name: "Calibri", size: 12 };
        
        // Set warna tab sheet
        if (ruteId === 'COMBINED_LEMBAR_PADANGBAI') {
          // Biru untuk sheet gabungan
          worksheet.properties.tabColor = { argb: 'FF1F497D' };
        } else {
          // Hijau untuk sheet individual
          worksheet.properties.tabColor = { argb: 'FF00B050' };
        }

        const setBorder = (cell, style = "thin") => {
          cell.border = { top: { style }, left: { style }, bottom: { style }, right: { style } };
        };

        const mergeHeader = (r1, c1, r2, c2, value) => {
          const a = `${getColumnLetter(c1)}${r1}`;
          const b = `${getColumnLetter(c2)}${r2}`;
          if (a !== b) worksheet.mergeCells(`${a}:${b}`);
          const cell = worksheet.getCell(a);
          cell.value = value;
          cell.font = { name: "Calibri", size: 11, bold: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        };

        // ---- Build dynamicCols ----
        const dynamicCols = [];
        dynamicCols.push({ key: 'dws',       label: 'DWS',  tarifRow8: tarifDwsNormal,  isCustom: false, type: 'pnp' });
        dynamicCols.push({ key: 'dwsCustom', label: 'DWS+', tarifRow8: tarifDwsCustom,  isCustom: true,  type: 'pnp', hideIfEmpty: !hasCustomDws });
        dynamicCols.push({ key: 'bayi',      label: 'BAYI', tarifRow8: tarifBayiNormal, isCustom: false, type: 'pnp' });
        dynamicCols.push({ key: 'bayiCustom',label: 'BAYI+',tarifRow8: tarifBayiCustom, isCustom: true,  type: 'pnp', hideIfEmpty: !hasCustomBayi });
        dynamicCols.push({ key: 'jmlPnp',    label: 'JML',  isFormula: true,             type: 'jmlPnp' });

        const nomorDiproses = new Set();
        tarifData.forEach(tarif => {
          const nomorGol     = parseInt(tarif.golongan?.nomor_golongan || 0);
          const isStandar    = GOLONGAN_STANDAR.includes(nomorGol);
          const adaData      = golonganSet.has(tarif.golongan_id);
          const isPnpBrgPair = GOLONGAN_PNP_BRG_MAP[nomorGol] !== undefined;

          if (isPnpBrgPair) {
            if (nomorDiproses.has(nomorGol)) return;
            nomorDiproses.add(nomorGol);
            const g = GOLONGAN_PNP_BRG_MAP[nomorGol];
            dynamicCols.push({ key: `knd_${g.pnp_id}_normal`, label: 'PNP',  nomorGolLabel: toRomawi(nomorGol), tarifRow8: g.pnp_tarif || null,        isCustom: false, type: 'knd', subType: 'pnp',        golongan_id: g.pnp_id, nomorGol, isPnpBrg: true, hideIfEmpty: false });
            dynamicCols.push({ key: `knd_${g.pnp_id}_custom`, label: 'PNP+', nomorGolLabel: toRomawi(nomorGol), tarifRow8: g.pnp_tarif_custom || null,  isCustom: true,  type: 'knd', subType: 'pnp_custom', golongan_id: g.pnp_id, nomorGol, isPnpBrg: true, hideIfEmpty: !g.pnp_hasCustom });
            dynamicCols.push({ key: `knd_${g.brg_id}_normal`, label: 'BRG',  nomorGolLabel: toRomawi(nomorGol), tarifRow8: g.brg_tarif || null,        isCustom: false, type: 'knd', subType: 'brg',        golongan_id: g.brg_id, nomorGol, isPnpBrg: true, hideIfEmpty: false });
            dynamicCols.push({ key: `knd_${g.brg_id}_custom`, label: 'BRG+', nomorGolLabel: toRomawi(nomorGol), tarifRow8: g.brg_tarif_custom || null,  isCustom: true,  type: 'knd', subType: 'brg_custom', golongan_id: g.brg_id, nomorGol, isPnpBrg: true, hideIfEmpty: !g.brg_hasCustom });
          } else {
            dynamicCols.push({ key: `knd_${tarif.golongan_id}_normal`, label: toRomawi(nomorGol),       nomorGolLabel: toRomawi(nomorGol), tarifRow8: tarif.tarif || null,        isCustom: false, type: 'knd', subType: 'normal',       golongan_id: tarif.golongan_id, nomorGol, isPnpBrg: false, hideIfEmpty: !isStandar && !adaData });
            dynamicCols.push({ key: `knd_${tarif.golongan_id}_custom`, label: `${toRomawi(nomorGol)}+`, nomorGolLabel: toRomawi(nomorGol), tarifRow8: tarif.tarif_custom || null, isCustom: true,  type: 'knd', subType: 'normal_custom', golongan_id: tarif.golongan_id, nomorGol, isPnpBrg: false, hideIfEmpty: !tarif.hasCustom });
          }
        });

        dynamicCols.push({ key: 'jmlKnd',    label: 'JML',              isFormula: true, type: 'jmlKnd' });
        dynamicCols.push({ key: 'pendPnp',   label: 'PENUMPANG',        type: 'pendapatan' });
        dynamicCols.push({ key: 'pendKnd',   label: 'KENDARAAN',        type: 'pendapatan' });
        dynamicCols.push({ key: 'pendBrg',   label: 'BARANG',           type: 'pendapatan' });
        dynamicCols.push({ key: 'pendTotal', label: 'TOTAL PENDAPATAN', isFormula: true, type: 'pendapatan' });
        dynamicCols.push({ key: 'rataRata',  label: 'RATA-RATA PER TRIP', isFormula: true, type: 'rataRata' });

        const visibleCols = dynamicCols.filter(c => !c.hideIfEmpty);
        const dynStartCol = 7;
        const colIndexMap = {};
        visibleCols.forEach((col, i) => { colIndexMap[col.key] = dynStartCol + i; });
        const lastCol = dynStartCol + visibleCols.length - 1;

        // ---- Column widths ----
        worksheet.columns = [
          { width: 10 }, { width: 10 }, { width: 40 }, { width: 40 }, { width: 10 }, { width: 8 }, { width: 20 },
          ...visibleCols.map(c => ({
            width:
              c.key === 'pendTotal' || c.key === 'pendPnp' || c.key === 'pendKnd' || c.key === 'pendBrg' ? 20 :
              c.type === 'rataRata' ? 20 :
              c.label === 'JML' ? 10 : 10
          }))
        ];

        // ---- Header info rows 2-6 ----
        const boldFont12 = { name: "Calibri", size: 12, bold: true };
        worksheet.getCell("B2").value = "PRODUKSI DAN PENDAPATAN KAPAL PENYEBERANGAN"; worksheet.getCell("B2").font = boldFont12;
        worksheet.getCell("B3").value = "PELABUHAN PT. ASDP INDONESIA FERRY (PERSERO)"; worksheet.getCell("B3").font = boldFont12;
        worksheet.getCell("B4").value = `PELABUHAN    : ${ruteInfo.nama_pelabuhan_asal}`; worksheet.getCell("B4").font = boldFont12;
        worksheet.getCell("B5").value = `CABANG       : ${ruteInfo.nama_pelabuhan_asal}`; worksheet.getCell("B5").font = boldFont12;
        worksheet.getCell("B6").value = `PERIODE      : ${periodeAwal} s/d ${periodeAkhir}`; worksheet.getCell("B6").font = boldFont12;

        // ---- Row 8: Tarif ----
        worksheet.getRow(8).height = 30;
        worksheet.mergeCells('E8:F8');
        const tarifLabelCell = worksheet.getCell('E8');
        tarifLabelCell.value = "Tarif Jasa Penyeberangan";
        tarifLabelCell.font = boldFont12;
        tarifLabelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        visibleCols.forEach(col => {
          if ((col.type === 'pnp' || col.type === 'knd') && col.tarifRow8 != null) {
            const cell = worksheet.getCell(8, colIndexMap[col.key]);
            cell.value = col.tarifRow8; cell.font = boldFont12;
            cell.alignment = { horizontal: "center", vertical: "middle" }; cell.numFmt = "#,##0";
          }
        });

        // ---- Rows 9-12: Headers ----
        mergeHeader(9, 2, 12, 2, "NO");
        mergeHeader(9, 3, 12, 3, "KAPAL");
        mergeHeader(9, 4, 12, 4, "PERUSAHAAN");
        mergeHeader(9, 5, 12, 5, "GT");
        mergeHeader(9, 6, 12, 6, "TRIP");

        const pnpAllCols = visibleCols.filter(c => c.type === 'pnp' || c.type === 'jmlPnp').map(c => colIndexMap[c.key]);
        if (pnpAllCols.length > 0) mergeHeader(9, pnpAllCols[0], 9, pnpAllCols[pnpAllCols.length - 1], " ");

        const kndAllCols = visibleCols.filter(c => c.type === 'knd' || c.type === 'jmlKnd').map(c => colIndexMap[c.key]);
        if (kndAllCols.length > 0) mergeHeader(9, kndAllCols[0], 9, kndAllCols[kndAllCols.length - 1], "");

        const pendCols = visibleCols.filter(c => c.type === 'pendapatan').map(c => colIndexMap[c.key]);
        if (pendCols.length > 0) mergeHeader(9, pendCols[0], 9, pendCols[pendCols.length - 1], "PENDAPATAN (Rp.)");
        if (colIndexMap['rataRata']) mergeHeader(9, colIndexMap['rataRata'], 12, colIndexMap['rataRata'], "RATA-RATA\nPER TRIP");

        const dwsCols  = visibleCols.filter(c => c.type === 'pnp' && c.key.startsWith('dws')).map(c => colIndexMap[c.key]);
        const bayiCols = visibleCols.filter(c => c.type === 'pnp' && c.key.startsWith('bayi')).map(c => colIndexMap[c.key]);
        const allDwsBayiCols = [...dwsCols, ...bayiCols];
        if (allDwsBayiCols.length > 0) mergeHeader(10, allDwsBayiCols[0], 10, allDwsBayiCols[allDwsBayiCols.length - 1], "");
        if (colIndexMap['jmlPnp']) mergeHeader(11, colIndexMap['jmlPnp'], 12, colIndexMap['jmlPnp'], "JML");
        if (allDwsBayiCols.length > 0) mergeHeader(11, allDwsBayiCols[0], 11, allDwsBayiCols[allDwsBayiCols.length - 1], "EKONOMI");
        visibleCols.filter(c => c.type === 'pnp').forEach(col => mergeHeader(12, colIndexMap[col.key], 12, colIndexMap[col.key], col.label));

        const kndOnlyCols = visibleCols.filter(c => c.type === 'knd').map(c => colIndexMap[c.key]);
        if (kndOnlyCols.length > 0) mergeHeader(10, kndOnlyCols[0], 10, kndOnlyCols[kndOnlyCols.length - 1], "KENDARAAN PER GOLONGAN");
        if (colIndexMap['jmlKnd']) mergeHeader(10, colIndexMap['jmlKnd'], 12, colIndexMap['jmlKnd'], "JML");

        // Build golonganGroups
        const golonganGroups = {};
        const nomorGolDiproses = new Set();
        tarifData.forEach(tarif => {
          const nomorGol = parseInt(tarif.golongan?.nomor_golongan || 0);
          if (GOLONGAN_PNP_BRG_MAP[nomorGol]) {
            if (nomorGolDiproses.has(nomorGol)) return;
            nomorGolDiproses.add(nomorGol);
            const g = GOLONGAN_PNP_BRG_MAP[nomorGol];
            const cols = [colIndexMap[`knd_${g.pnp_id}_normal`], colIndexMap[`knd_${g.pnp_id}_custom`], colIndexMap[`knd_${g.brg_id}_normal`], colIndexMap[`knd_${g.brg_id}_custom`]].filter(Boolean);
            if (cols.length > 0) golonganGroups[`nomor_${nomorGol}`] = { cols, label: toRomawi(nomorGol), isPnpBrg: true };
          } else {
            const cols = [colIndexMap[`knd_${tarif.golongan_id}_normal`], colIndexMap[`knd_${tarif.golongan_id}_custom`]].filter(Boolean);
            if (cols.length > 0) golonganGroups[tarif.golongan_id] = { cols, label: toRomawi(nomorGol), isPnpBrg: false };
          }
        });

        Object.values(golonganGroups).forEach(g => {
          if (g.isPnpBrg && g.cols.length > 0) mergeHeader(11, g.cols[0], 11, g.cols[g.cols.length - 1], `GOL ${g.label}`);
        });
        visibleCols.filter(c => c.type === 'knd').forEach(col => {
          if (col.isPnpBrg) mergeHeader(12, colIndexMap[col.key], 12, colIndexMap[col.key], col.label);
          else mergeHeader(11, colIndexMap[col.key], 12, colIndexMap[col.key], col.label);
        });
        pendCols.forEach((ci, i) => mergeHeader(10, ci, 12, ci, ['PENUMPANG', 'KENDARAAN', 'BARANG', 'TOTAL\nPENDAPATAN'][i] || ''));

        for (let row = 9; row <= 12; row++)
          for (let col = 2; col <= lastCol; col++) setBorder(worksheet.getCell(row, col), "thin");
        worksheet.getRow(9).height = 25;
        worksheet.getRow(10).height = 20;
        worksheet.getRow(11).height = 20;
        worksheet.getRow(12).height = 20;

        // ===================== DATA ROWS (template-based) =====================
        console.log('Writing data rows...');
        let currentRow = 13;

        // Pre-build merge ranges perusahaan berdasarkan perusahaan yang sama berurutan
        // Jika perusahaan sama dengan yang sebelumnya, maka akan di-merge
        const perusahaanMergeRanges = [];
        let mergeStart = 0;
        let mergePerusahaan = "";

        templateKapal.forEach((kapalTemplate, idx) => {
          const currentPerusahaan = kapalTemplate.perusahaan || "";
          const isLast = idx === templateKapal.length - 1;

          if (idx === 0) {
            // Baris pertama, mulai range baru
            mergeStart = idx;
            mergePerusahaan = currentPerusahaan;
          } else if (currentPerusahaan !== mergePerusahaan) {
            // Perusahaan berbeda, tutup range sebelumnya
            if (mergePerusahaan !== "") {
              perusahaanMergeRanges.push({
                startRow: 13 + mergeStart,
                endRow: 13 + idx - 1,
                nama: mergePerusahaan
              });
            }
            // Mulai range baru
            mergeStart = idx;
            mergePerusahaan = currentPerusahaan;
          }

          // Tutup range terakhir
          if (isLast && mergePerusahaan !== "") {
            perusahaanMergeRanges.push({
              startRow: 13 + mergeStart,
              endRow: 13 + idx,
              nama: mergePerusahaan
            });
          }
        });

        templateKapal.forEach((kapalTemplate) => {
          // Match produksi ke template kapal berdasarkan nama
          const kapalDataItem = Object.values(groupedByKapal).find(
            k => k.nama_kapal.trim().toUpperCase() === kapalTemplate.nama.trim().toUpperCase()
          );

          const row = worksheet.getRow(currentRow);
          const setCell = (key, value) => { if (colIndexMap[key] !== undefined) row.getCell(colIndexMap[key]).value = value; };

          row.getCell(2).value = kapalTemplate.no;
          row.getCell(3).value = kapalTemplate.nama;
          row.getCell(4).value = kapalTemplate.perusahaan;
          row.getCell(5).value = kapalTemplate.gt;
          row.getCell(6).value = kapalDataItem ? kapalDataItem.trips : 0;

          if (kapalDataItem) {
            setCell('dws', kapalDataItem.dws); setCell('dwsCustom', kapalDataItem.dwsCustom);
            setCell('bayi', kapalDataItem.bayi); setCell('bayiCustom', kapalDataItem.bayiCustom);
            tarifData.forEach(t => {
              setCell(`knd_${t.golongan_id}_normal`, kapalDataItem.kendaraanByGolongan[t.golongan_id] || 0);
              setCell(`knd_${t.golongan_id}_custom`, kapalDataItem.kendaraanCustomByGolongan[t.golongan_id] || 0);
            });
          } else {
            setCell('dws', 0); setCell('dwsCustom', 0); setCell('bayi', 0); setCell('bayiCustom', 0);
            tarifData.forEach(t => { setCell(`knd_${t.golongan_id}_normal`, 0); setCell(`knd_${t.golongan_id}_custom`, 0); });
          }

          // JML penumpang formula
          if (colIndexMap['jmlPnp']) {
            const keys = visibleCols.filter(c => c.type === 'pnp').map(c => colIndexMap[c.key]);
            row.getCell(colIndexMap['jmlPnp']).value = keys.length ? { formula: keys.map(ci => `${getColumnLetter(ci)}${currentRow}`).join('+') } : 0;
          }

          // JML kendaraan formula
          if (colIndexMap['jmlKnd']) {
            const keys = visibleCols.filter(c => c.type === 'knd').map(c => colIndexMap[c.key]);
            row.getCell(colIndexMap['jmlKnd']).value = keys.length ? { formula: `SUM(${getColumnLetter(keys[0])}${currentRow}:${getColumnLetter(keys[keys.length - 1])}${currentRow})` } : 0;
          }

          // Pendapatan penumpang
          if (colIndexMap['pendPnp']) {
            const terms = visibleCols.filter(c => c.type === 'pnp' && c.tarifRow8).map(c => {
              const col = getColumnLetter(colIndexMap[c.key]);
              return `${col}${currentRow}*$${col}$8`;
            });
            row.getCell(colIndexMap['pendPnp']).value = terms.length ? { formula: terms.join('+') } : 0;
          }

          // Pendapatan kendaraan PNP
          if (colIndexMap['pendKnd']) {
            const terms = visibleCols.filter(c => c.type === 'knd' && c.tarifRow8 && ['pnp','pnp_custom','normal','normal_custom'].includes(c.subType)).map(c => {
              const col = getColumnLetter(colIndexMap[c.key]);
              return `${col}${currentRow}*$${col}$8`;
            });
            row.getCell(colIndexMap['pendKnd']).value = terms.length ? { formula: terms.join('+') } : 0;
          }

          // Pendapatan barang
          if (colIndexMap['pendBrg']) {
            const terms = visibleCols.filter(c => c.type === 'knd' && c.tarifRow8 && ['brg','brg_custom'].includes(c.subType)).map(c => {
              const col = getColumnLetter(colIndexMap[c.key]);
              return `${col}${currentRow}*$${col}$8`;
            });
            row.getCell(colIndexMap['pendBrg']).value = terms.length ? { formula: terms.join('+') } : 0;
          }

          // Total pendapatan
          if (colIndexMap['pendTotal']) {
            const pL = getColumnLetter(colIndexMap['pendPnp']);
            const kL = getColumnLetter(colIndexMap['pendKnd']);
            const bL = getColumnLetter(colIndexMap['pendBrg']);
            row.getCell(colIndexMap['pendTotal']).value = { formula: `${pL}${currentRow}+${kL}${currentRow}+${bL}${currentRow}` };
          }

          // Rata-rata per trip
          if (colIndexMap['rataRata'] && colIndexMap['pendTotal']) {
            const tL = getColumnLetter(colIndexMap['pendTotal']);
            row.getCell(colIndexMap['rataRata']).value = { formula: `IF(F${currentRow}>0,${tL}${currentRow}/F${currentRow},0)` };
          }

          // Styling
          row.getCell(2).alignment = { horizontal: "center", vertical: "center" };
          row.getCell(3).alignment = { horizontal: "left",   vertical: "center" };
          row.getCell(4).alignment = { horizontal: "left",   vertical: "center" };
          for (let col = 5; col <= lastCol; col++) row.getCell(col).alignment = { horizontal: "right", vertical: "center" };
          ['pendPnp','pendKnd','pendBrg','pendTotal','rataRata'].filter(k => colIndexMap[k]).forEach(k => { row.getCell(colIndexMap[k]).numFmt = "#,##0"; });
          for (let col = 2; col <= lastCol; col++) { row.getCell(col).font = { name: "Calibri", size: 11, bold: true }; setBorder(row.getCell(col), "thin"); }

          currentRow++;
        });

        // ===================== MERGE PERUSAHAAN =====================
        perusahaanMergeRanges.forEach(range => {
          try {
            if (range.startRow < range.endRow) {
              worksheet.mergeCells(`D${range.startRow}:D${range.endRow}`);
            }
            const cell = worksheet.getCell(`D${range.startRow}`);
            cell.value = range.nama;
            cell.font = { name: "Calibri", size: 11, bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          } catch (e) {
            // Fallback jika merge gagal
            const cell = worksheet.getCell(`D${range.startRow}`);
            cell.value = range.nama;
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        });

        // ===================== TOTAL ROW =====================
        const totalRow = worksheet.getRow(currentRow);
        const dataStartRow = 13;
        const dataEndRow   = currentRow - 1;

        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        totalRow.getCell(2).value = "JUMLAH";
        totalRow.getCell(2).font = { name: "Calibri", size: 12, bold: true };
        totalRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
        totalRow.getCell(6).value = { formula: `SUM(F${dataStartRow}:F${dataEndRow})` };

        visibleCols.forEach(col => {
          if (col.type === 'rataRata' || !colIndexMap[col.key]) return;
          const ci = colIndexMap[col.key];
          totalRow.getCell(ci).value = { formula: `SUM(${getColumnLetter(ci)}${dataStartRow}:${getColumnLetter(ci)}${dataEndRow})` };
        });
        ['pendPnp','pendKnd','pendBrg','pendTotal'].filter(k => colIndexMap[k]).forEach(k => { totalRow.getCell(colIndexMap[k]).numFmt = "#,##0"; });
        for (let col = 2; col <= lastCol; col++) {
          totalRow.getCell(col).font = { name: "Calibri", size: 12, bold: true };
          totalRow.getCell(col).alignment = { horizontal: "right", vertical: "middle" };
          totalRow.getCell(col).border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }
        totalRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };

        // ===================== TABEL ANALISIS PER PERUSAHAAN (HANYA UNTUK SHEET GABUNGAN) =====================
        if (ruteId === 'COMBINED_LEMBAR_PADANGBAI') {
          console.log('Adding company analysis table for combined sheet...');
          
          // Kumpulkan daftar perusahaan unik dari template kapal, urutan sesuai kemunculan pertama
          const perusahaanList = [];
          const perusahaanSeen = new Set();
          templateKapal.forEach(kapal => {
            if (kapal.perusahaan) {
              const namaPerusahaan = kapal.perusahaan.trim();
              if (!perusahaanSeen.has(namaPerusahaan)) {
                perusahaanSeen.add(namaPerusahaan);
                perusahaanList.push(namaPerusahaan);
              }
            }
          });

          // Mapping perusahaan ke baris kapal di sheet
          const perusahaanRowMap = {};
          perusahaanList.forEach(nama => {
            perusahaanRowMap[nama] = [];
          });

          // Isi mapping dengan nomor baris kapal (13 adalah baris pertama data)
          templateKapal.forEach((kapal, idx) => {
            const namaPerusahaan = kapal.perusahaan ? kapal.perusahaan.trim() : "";
            if (namaPerusahaan && perusahaanRowMap[namaPerusahaan]) {
              perusahaanRowMap[namaPerusahaan].push(13 + idx);
            }
          });

          // Baris kosong
          currentRow++;
          
          // Header tabel analisis (baris 42)
          currentRow++;
          const headerRow = worksheet.getRow(currentRow);
          headerRow.height = 25;
          
          headerRow.getCell(2).value = "NO";
          headerRow.getCell(3).value = "PERUSAHAAN";
          headerRow.getCell(4).value = "PENDAPATAN";
          headerRow.getCell(5).value = "%";
          headerRow.getCell(6).value = "JMLH KAPAL";
          headerRow.getCell(7).value = "PENDAPATAN/KAPAL";
          headerRow.getCell(8).value = "%";

          // Kolom 2 - 5 (biru)
          for (let col = 2; col <= 5; col++) {
            const cell = headerRow.getCell(col);
            cell.font = { name: "Calibri", size: 11, bold: true};
            cell.fill = { 
              type: "pattern", 
              pattern: "solid", 
              fgColor: { argb: "FF00B0F0" } 
            };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            setBorder(cell, "thin");
          }

          // Kolom 6 - 8 (abu-abu misalnya)
          for (let col = 6; col <= 8; col++) {
            const cell = headerRow.getCell(col);
            cell.font = { name: "Calibri", size: 11, bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            setBorder(cell, "thin");
          }

          // Data per perusahaan (baris 43-53)
          let no = 1;
          const analysisStartRow = currentRow + 1;
          const analysisTotalRowNum = currentRow + 1 + perusahaanList.length; // Baris total
          
          // Kolom pendapatan total (sesuaikan dengan colIndexMap['pendTotal'])
          const pendTotalCol = colIndexMap['pendTotal'] ? getColumnLetter(colIndexMap['pendTotal']) : 'Z';
          
          perusahaanList.forEach(namaPerusahaan => {
            currentRow++;
            const row = worksheet.getRow(currentRow);
            const kapalRows = perusahaanRowMap[namaPerusahaan] || [];
            
            row.getCell(2).value = no++;
            row.getCell(3).value = namaPerusahaan;
            
            // Pendapatan: SUM dari baris-baris kapal perusahaan ini
            // Contoh: =SUM(Z13:Z14)+Z20 (jika kapal di baris 13, 14, 20)
            let formulaParts = [];
            if (kapalRows.length > 0) {
              // Buat formula SUM untuk baris yang berurutan dan tambahkan baris terpisah
              const ranges = [];
              let rangeStart = kapalRows[0];
              let rangeEnd = kapalRows[0];
              
              for (let i = 1; i < kapalRows.length; i++) {
                if (kapalRows[i] === rangeEnd + 1) {
                  // Baris berurutan, extend range
                  rangeEnd = kapalRows[i];
                } else {
                  // Baris tidak berurutan, tutup range sebelumnya
                  if (rangeStart === rangeEnd) {
                    ranges.push(`${pendTotalCol}${rangeStart}`);
                  } else {
                    ranges.push(`${pendTotalCol}${rangeStart}:${pendTotalCol}${rangeEnd}`);
                  }
                  rangeStart = kapalRows[i];
                  rangeEnd = kapalRows[i];
                }
              }
              
              // Tutup range terakhir
              if (rangeStart === rangeEnd) {
                ranges.push(`${pendTotalCol}${rangeStart}`);
              } else {
                ranges.push(`${pendTotalCol}${rangeStart}:${pendTotalCol}${rangeEnd}`);
              }
              
              // Gabungkan semua ranges dengan SUM
              formulaParts = ranges.map(r => r.includes(':') ? `SUM(${r})` : r);
            }
            row.getCell(4).value = formulaParts.length > 0 ? { formula: formulaParts.join('+') } : 0;
            row.getCell(4).numFmt = "#,##0";
            
            // % Pendapatan (D/Total D)
            row.getCell(5).value = { formula: `D${currentRow}/$D$${analysisTotalRowNum}` };
            row.getCell(5).numFmt = "0.00%";
            
            row.getCell(6).value = kapalRows.length;
            
            // Pendapatan per kapal
            row.getCell(7).value = { formula: `IF(F${currentRow}>0,D${currentRow}/F${currentRow},0)` };
            row.getCell(7).numFmt = "#,##0";
            
            // % Pendapatan per kapal (G/Total G)
            row.getCell(8).value = { formula: `G${currentRow}/$G$${analysisTotalRowNum}` };
            row.getCell(8).numFmt = "0.00%";
            
            // Styling
            row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
            row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
            for (let col = 4; col <= 8; col++) {
              row.getCell(col).alignment = { horizontal: "right", vertical: "middle" };
            }
            
            for (let col = 2; col <= 8; col++) {
              row.getCell(col).font = { name: "Calibri", size: 11, bold: true };
              setBorder(row.getCell(col), "thin");
            }
          });
          
          const analysisEndRow = currentRow;

          // Total row analisis (baris 54)
          currentRow++;
          const totalAnalysisRow = worksheet.getRow(currentRow);
          
          worksheet.mergeCells(currentRow, 2, currentRow, 3);

          // 🔹 Isi teks TOTAL di cell pertama hasil merge (kolom 2)
          const totalLabelCell = totalAnalysisRow.getCell(2);
          totalLabelCell.value = "TOTAL";
          totalLabelCell.alignment = { horizontal: "center", vertical: "middle" };
          totalAnalysisRow.getCell(4).value = { formula: `SUM(D${analysisStartRow}:D${analysisEndRow})` };
          totalAnalysisRow.getCell(4).numFmt = "#,##0";
          totalAnalysisRow.getCell(5).value = { formula: `SUM(E${analysisStartRow}:E${analysisEndRow})` };
          totalAnalysisRow.getCell(5).numFmt = "0.00%";
          totalAnalysisRow.getCell(6).value = { formula: `SUM(F${analysisStartRow}:F${analysisEndRow})` };
          totalAnalysisRow.getCell(7).value = { formula: `SUM(G${analysisStartRow}:G${analysisEndRow})` };
          totalAnalysisRow.getCell(7).numFmt = "#,##0";
          totalAnalysisRow.getCell(8).value = { formula: `SUM(H${analysisStartRow}:H${analysisEndRow})` };
          totalAnalysisRow.getCell(8).numFmt = "0.00%";
          
          for (let col = 3; col <= 8; col++) {
            const cell = totalAnalysisRow.getCell(col);
            cell.font = { name: "Calibri", size: 12, bold: true };
            cell.alignment = { horizontal: col === 3 ? "center" : "right", vertical: "middle" };
            cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
          }
          
          console.log('Company analysis table added successfully');
        }

        // ===================== PAGE SETUP =====================
        worksheet.views = [{ state: "frozen", ySplit: 12 }];
        worksheet.pageSetup = { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } };
        worksheet.pageSetup.printArea = `B2:${getColumnLetter(lastCol)}${currentRow}`;

      } // ===== END LOOP RUTE =====

      console.log(`\n=== Workbook complete with ${workbook.worksheets.length} sheets ===`);
      
      if (workbook.worksheets.length === 0) {
        return res.status(404).json({ error: "Tidak ada sheet yang dapat dibuat. Pastikan template kapal tersedia untuk rute yang dipilih." });
      }

      console.log('Writing Excel file to response...');
      const filename = `Laporan_Produksi_${periodeAwal}_sampai_${periodeAkhir}.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
      console.log('=== EXPORT EXCEL COMPLETE ===');

    } catch (error) {
      console.error("Export Excel Error:", error);
      console.error("Error stack:", error.stack);
      next(error);
    }
  }
}

module.exports = ProduksiExportController;
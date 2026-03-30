const ProduksiModel = require("../models/Produksi");
const ProduksiKendaraanModel = require("../models/ProduksiKendaraan");
const KapalModel = require("../models/Kapal");
const RuteModel = require("../models/Rute");
const TemplateKapalRuteModel = require("../models/TemplateKapalRute");
const TarifKendaraanModel = require("../models/TarifKendaraan");
const TarifPenumpangModel = require("../models/TarifPenumpang");
const SuratDokumenModel = require("../models/SuratDokumen");
const ExcelJS = require("exceljs");
const ProduksiPenumpangModel = require("../models/ProduksiPenumpang");
const path = require("path");

class LaporanKinerjaAsdpController {
  static async exportKinerjaAsdp(req, res, next) {
    try {
      console.log("=== EXPORT KINERJA ASDP START ===");
      console.log("Query params:", req.query);

      const getColumnLetter = (colNumber) => {
        let letter = "";
        while (colNumber > 0) {
          const remainder = (colNumber - 1) % 26;
          letter = String.fromCharCode(65 + remainder) + letter;
          colNumber = Math.floor((colNumber - 1) / 26);
        }
        return letter;
      };

      if (!req.query.tanggal_dari || !req.query.tanggal_sampai) {
        return res.status(400).json({
          error:
            "Pilih periode (tanggal dari dan tanggal sampai) terlebih dahulu.",
        });
      }
      
      if (!req.query.rute_id) {
        return res.status(400).json({
          error: "Pilih rute terlebih dahulu untuk export Kinerja ASDP",
        });
      }

      // Validasi 1 bulan
      const tanggalDari = new Date(req.query.tanggal_dari);
      const tanggalSampai = new Date(req.query.tanggal_sampai);

      if (
        tanggalDari.getMonth() !== tanggalSampai.getMonth() ||
        tanggalDari.getFullYear() !== tanggalSampai.getFullYear()
      ) {
        return res.status(400).json({
          error:
            "Periode harus dalam 1 bulan yang sama untuk export Kinerja ASDP",
        });
      }

      const rute_id = parseInt(req.query.rute_id);

      // Ambil data rute
      const ruteData = await RuteModel.getById(rute_id);
      if (!ruteData) {
        return res.status(404).json({
          error: "Rute tidak ditemukan",
        });
      }

      console.log("Rute data:", ruteData);

      const namaRute = ruteData.nama_rute;
      const pelabuhanAsal = ruteData.pelabuhan_asal.nama_pelabuhan;
      const pelabuhanTujuan = ruteData.pelabuhan_tujuan.nama_pelabuhan;
      const jarak = ruteData.jarak || 0;

      // Ambil kapal ASDP dari template rute
      const kapalAsdpTemplate = await TemplateKapalRuteModel.getAsdpKapalByRute(rute_id);
      
      if (kapalAsdpTemplate.length === 0) {
        return res.status(404).json({
          error: `Rute ${namaRute} tidak memiliki kapal ASDP`,
        });
      }

      console.log("Kapal ASDP dari template:", kapalAsdpTemplate.map(k => k.nama_kapal));

      const filters = {
        tanggal_dari: req.query.tanggal_dari,
        tanggal_sampai: req.query.tanggal_sampai,
      };

      const produksiResult = await ProduksiModel.getAll(filters);
      const produksiList = produksiResult.data || [];
      console.log("Total produksi count (semua):", produksiList.length);

      const suratDokumen = await SuratDokumenModel.getActive();
      console.log("Data surat dokumen:", suratDokumen);
      const kapalAsdpIds = kapalAsdpTemplate.map(k => k.kapal_id);
      
      const produksiAsdp = produksiList.filter(p => {
        if (!kapalAsdpIds.includes(p.kapal_id)) return false;

        const pelabuhanAsalProd = String(p.nama_pelabuhan_asal || "").toUpperCase();
        const pelabuhanTujuanProd = String(p.nama_pelabuhan_tujuan || "").toUpperCase();
        const pelabuhanAsalRute = pelabuhanAsal.toUpperCase();
        const pelabuhanTujuanRute = pelabuhanTujuan.toUpperCase();

        const isAsalTujuan = 
          pelabuhanAsalProd.includes(pelabuhanAsalRute) && 
          pelabuhanTujuanProd.includes(pelabuhanTujuanRute);
        
        // Cek arah: tujuan → asal (bolak-balik)
        const isTujuanAsal = 
          pelabuhanAsalProd.includes(pelabuhanTujuanRute) && 
          pelabuhanTujuanProd.includes(pelabuhanAsalRute);
        
        return isAsalTujuan || isTujuanAsal;
      });
      
      console.log(`Produksi ASDP untuk rute ${namaRute}:`, produksiAsdp.length);
      console.log(`Filter: Kapal ASDP (${kapalAsdpIds.length}) + Pelabuhan ${pelabuhanAsal} ↔ ${pelabuhanTujuan}`);

      const kapalAsdpLembarPadangbai = kapalAsdpTemplate.map((k, index) => {
        let namaKapal = k.nama_kapal.toUpperCase();
        if (namaKapal.startsWith("KMP.")) {
          namaKapal = namaKapal.substring(4).trim();
        }
        return {
          no: index + 1,
          nama: namaKapal,
          kapal_id: k.kapal_id,
          gt: k.gt,
        };
      });

      console.log(
        "Kapal ASDP untuk rute ini:",
        kapalAsdpLembarPadangbai.map((k) => k.nama),
      );

      if (kapalAsdpLembarPadangbai.length === 0) {
        return res
          .status(404)
          .json({ error: "Tidak ada kapal ASDP ditemukan dalam database" });
      }

      // sheet 1 Kinerja kapal
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Kinerja KAPAL");
      worksheet.properties.defaultFont = { name: "Calibri", size: 11 };
      worksheet.properties.tabColor = { argb: "FF00B050" };

      const setBorder = (cell, style = "thin") => {
        cell.border = {
          top: { style },
          left: { style },
          bottom: { style },
          right: { style },
        };
      };

      const mergeAndStyle = (range, value, options = {}) => {
        worksheet.mergeCells(range);
        const cell = worksheet.getCell(range.split(":")[0]);
        cell.value = value;
        if (options.font) cell.font = options.font;
        if (options.alignment) cell.alignment = options.alignment;
        if (options.fill) cell.fill = options.fill;
        if (options.border) setBorder(cell, options.border);
        return cell;
      };

      // Format bulan untuk header
      const bulanNama = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktoberr",
        "November",
        "Desember",
      ];
      const bulan = bulanNama[tanggalDari.getMonth()];
      const tahun = tanggalDari.getFullYear();
      const bulanTahun = `${bulan}-${tahun.toString().slice(-2)}`;

      worksheet.getCell("A1").value = "LAPORAN KINERJA OPERASI KAPAL";
      worksheet.getCell("A1").font = { name: "Calibri", size: 16, bold: true };
      worksheet.getCell("A2").value = `CABANG ${pelabuhanAsal.toUpperCase()}`;
      worksheet.getCell("A2").font = { name: "Calibri", size: 16, bold: true };
      worksheet.getCell("A3").value = `BULAN ${bulan.toUpperCase()} ${tahun}`;
      worksheet.getCell("A3").font = { name: "Calibri", size: 16, bold: true };

      for (let i = 5; i <= 15; i++) {
        worksheet.getRow(i).height = 20;
      }

      mergeAndStyle("A5:C5", "BULAN", {
        font: { name: "Calibri", size: 11, bold: true },
        alignment: { horizontal: "right", vertical: "middle" },
        border: "thin",
      });
      mergeAndStyle("D5:AH5", bulanTahun, {
        font: { name: "Calibri", size: 11, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });
      mergeAndStyle("AI5:AJ5", "TRIP", {
        font: { name: "Calibri", size: 11, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });

      mergeAndStyle("A6:C6", "NAMA KAPAL", {
        font: { name: "Calibri", size: 11, bold: true },
        alignment: { horizontal: "left", vertical: "middle" },
        border: "thin",
      });

      for (let i = 1; i <= 31; i++) {
        const colIndex = 3 + i;

        const cell = worksheet.getCell(6, colIndex);
        cell.value = i;
        cell.font = { name: "Calibri", size: 11, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        setBorder(cell, "thin");

        worksheet.getColumn(colIndex).width = 10;
      }

      worksheet.getCell("AI6").value = "RENC";
      worksheet.getCell("AI6").font = { bold: true };
      worksheet.getCell("AI6").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet.getCell("AI6"), "thin");

      worksheet.getCell("AJ6").value = "REAL";
      worksheet.getCell("AJ6").font = { bold: true };
      worksheet.getCell("AJ6").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet.getCell("AJ6"), "thin");

      let currentRow = 7;

      mergeAndStyle(`A${currentRow}:A${currentRow}`, "A.", {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });
      mergeAndStyle(`B${currentRow}:C${currentRow}`, "Kapal Komersil", {
        font: { bold: true },
        alignment: { horizontal: "left", vertical: "middle" },
        border: "thin",
      });

      setBorder(worksheet.getCell("AI7"), "thin");
      setBorder(worksheet.getCell("AJ7"), "thin");

      currentRow++;

      mergeAndStyle(
        `A${currentRow}:C${currentRow}`,
        `LINTAS ${namaRute.toUpperCase()}`,
        {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "middle" },
          border: "thin",
        },
      );

      setBorder(worksheet.getCell("AI8"), "thin");
      setBorder(worksheet.getCell("AJ8"), "thin");

      currentRow++;

      const tripPerKapalPerTanggal = {};
      const tripPerKapalPerTanggalPerArah = {};

      // Nama singkat untuk key arah (gunakan nama pelabuhan)
      const asalKey = pelabuhanAsal.toLowerCase().replace(/\s+/g, '');
      const tujuanKey = pelabuhanTujuan.toLowerCase().replace(/\s+/g, '');

      produksiAsdp.forEach((p) => {
        let namaKapal = p.nama_kapal.toUpperCase();
        if (namaKapal.startsWith("KMP.")) {
          namaKapal = namaKapal.substring(4).trim();
        }
        const tanggal = new Date(p.tanggal_produksi).getDate();

        if (!tripPerKapalPerTanggal[namaKapal]) {
          tripPerKapalPerTanggal[namaKapal] = {};
        }
        if (!tripPerKapalPerTanggal[namaKapal][tanggal]) {
          tripPerKapalPerTanggal[namaKapal][tanggal] = 0;
        }
        tripPerKapalPerTanggal[namaKapal][tanggal]++;

        if (!tripPerKapalPerTanggalPerArah[namaKapal]) {
          tripPerKapalPerTanggalPerArah[namaKapal] = {
            asalTujuan: {},
            tujuanAsal: {},
          };
        }

        const pelabuhanAsalProduksi = String(p.nama_pelabuhan_asal || "").toUpperCase();
        const pelabuhanTujuanProduksi = String(
          p.nama_pelabuhan_tujuan || "",
        ).toUpperCase();

        // Cek arah: asal → tujuan
        if (
          pelabuhanAsalProduksi.includes(pelabuhanAsal.toUpperCase()) &&
          pelabuhanTujuanProduksi.includes(pelabuhanTujuan.toUpperCase())
        ) {
          if (
            !tripPerKapalPerTanggalPerArah[namaKapal].asalTujuan[tanggal]
          ) {
            tripPerKapalPerTanggalPerArah[namaKapal].asalTujuan[tanggal] = 0;
          }
          tripPerKapalPerTanggalPerArah[namaKapal].asalTujuan[tanggal]++;
        } 
        // Cek arah: tujuan → asal
        else if (
          pelabuhanAsalProduksi.includes(pelabuhanTujuan.toUpperCase()) &&
          pelabuhanTujuanProduksi.includes(pelabuhanAsal.toUpperCase())
        ) {
          if (
            !tripPerKapalPerTanggalPerArah[namaKapal].tujuanAsal[tanggal]
          ) {
            tripPerKapalPerTanggalPerArah[namaKapal].tujuanAsal[tanggal] = 0;
          }
          tripPerKapalPerTanggalPerArah[namaKapal].tujuanAsal[tanggal]++;
        }
      });

      kapalAsdpLembarPadangbai.forEach((kapal) => {
        const row = worksheet.getRow(currentRow);

        setBorder(row.getCell(1), "thin");

        row.getCell(2).value = kapal.no;
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
        setBorder(row.getCell(2), "thin");

        row.getCell(3).value = kapal.nama;
        row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
        setBorder(row.getCell(3), "thin");

        const tripData = tripPerKapalPerTanggal[kapal.nama] || {};
        const tanggalDariDate = tanggalDari.getDate();
        const tanggalSampaiDate = tanggalSampai.getDate();

        for (let i = 1; i <= 31; i++) {
          const colIndex = 3 + i;
          const cell = row.getCell(colIndex);

          // Cek apakah tanggal ini dalam periode
          const dalamPeriode = i >= tanggalDariDate && i <= tanggalSampaiDate;

          if (dalamPeriode) {
            cell.value = tripData[i] || 0;
            cell.font = { name: "Calibri", size: 8 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            setBorder(cell, "thin");

            // Background trip
            if (tripData[i] && tripData[i] > 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ff00ffff" },
              };
            } else {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFF00" },
              };
            }
          } else {
            // Di luar periode: kosongkan
            cell.value = "";
            setBorder(cell, "thin");
          }
        }

        // RENCANA
        row.getCell(35).value = 0;
        row.getCell(35).font = { name: "Calibri", size: 12 };
        row.getCell(35).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        setBorder(row.getCell(35), "thin");

        row.getCell(36).value = {
          formula: `SUM(D${currentRow}:AH${currentRow})`,
        };
        row.getCell(36).font = { name: "Calibri", size: 12 };
        row.getCell(36).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        setBorder(row.getCell(36), "thin");

        currentRow++;
      });

      // PERINTIS
      mergeAndStyle(`A${currentRow}:A${currentRow}`, "B.", {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });
      mergeAndStyle(`B${currentRow}:C${currentRow}`, "Kapal Perintis", {
        font: { bold: true },
        alignment: { horizontal: "left", vertical: "middle" },
        border: "thin",
      });

      for (let i = 4; i <= 36; i++) {
        setBorder(worksheet.getCell(currentRow, i), "thin");
      }

      currentRow++;

      for (let i = 1; i <= 36; i++) {
        setBorder(worksheet.getCell(currentRow, i), "thin");
      }

      currentRow++;

      // JUMLAH KAPAL
      mergeAndStyle(`A${currentRow}:C${currentRow}`, "JUMLAH KAPAL", {
        font: { name: "Calibri", size: 12, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });
      mergeAndStyle(
        `D${currentRow}:E${currentRow}`,
        kapalAsdpLembarPadangbai.length,
        {
          font: { name: "Calibri", size: 12, bold: true },
          alignment: { horizontal: "center", vertical: "middle" },
          border: "thin",
        },
      );
      mergeAndStyle(`F${currentRow}:G${currentRow}`, "UNIT", {
        font: { name: "Calibri", size: 12, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        border: "thin",
      });
      currentRow++;
      currentRow++;

      // WARNA OPERASI
      worksheet.getCell(`A${currentRow}`).value = "Keterangan :";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      currentRow++; // Baris kosong

      worksheet.getCell(`C${currentRow}`).value = "RENC";
      worksheet.getCell(`E${currentRow}`).value = "POLA OPERASI KAPAL";
      currentRow++;

      worksheet.getCell(`C${currentRow}`).value = "REAL";
      worksheet.getCell(`E${currentRow}`).value = "REALISASI OPERASI";
      currentRow++;
      currentRow++; // Baris kosong

      // Keterangan warna
      const keteranganWarna = [
        {
          color: "FF00FFFF",
          label: "KAPAL OPERASI",
          desc: "kondisi dimana kapal berlayar/operasi dari pelabuhan asal hingga ke pelabuhan tujuan",
        },
        {
          color: "FFFFFF00",
          label: "KAPAL ISTIRAHAT",
          desc: "kondisi kapal yang sandar/engker karena jadwal operasi",
        },
        {
          color: "ff9900cc",
          label: "KAPAL DOCKING",
          desc: "Kondisi kapal dinyatakan keluar lintasan untuk menjalani docking hingga kembali ke lintasan",
        },
        {
          color: "FFFF0000",
          label: "KAPAL RUSAK",
          desc: "Kondisi kapal tidak dapat beroperasi yang diakibatkan oleh kerusakan yang terjadi pada kapal",
        },
        {
          color: "FFFFFFFF",
          label: "CUACA BURUK",
          desc: "Kondisi kapal tidak dapat dioperasikan karena keadaan alam yang dapat membahayakan keselamatan kapal",
        },
        {
          color: "FF808000",
          label: "KAPAL SCRAP",
          desc: "Kondisi kapal untuk dihapuskan sebagai asset perusahaan",
        },
        { color: "FF632523", label: "SURAT/DOKUMENT", desc: "" },
      ];

      keteranganWarna.forEach((ket) => {
        mergeAndStyle(`B${currentRow}:C${currentRow}`, "", {
          font: { name: "Calibri", size: 10 },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: ket.color },
          },
          border: "thin",
        });
        worksheet.getCell(`E${currentRow}`).value = ket.label;
        worksheet.getCell(`I${currentRow}`).value = ket.desc;
        currentRow++;
        currentRow++;
      });

      // TANDA TANGAN
      const ttRow = 19;
      worksheet.getCell(`AI${ttRow}`).value = "GENERAL MANAGER";
      worksheet.getCell(`AI${ttRow}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(`AI${ttRow + 6}`).value = suratDokumen.general_manager;
      worksheet.getCell(`AI${ttRow + 6}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(`AI${ttRow + 6}`).font = {
        bold: true,
        underline: true,
      };

      currentRow = 40;

      mergeAndStyle(`C${currentRow}:C${currentRow + 1}`, "NAMA KAPAL", {
        font: { name: "Calibri", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
      });
      mergeAndStyle(`D${currentRow}:AH${currentRow}`, "TANGGAL", {
        font: { name: "Calibri", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
      });
      mergeAndStyle(`AI${currentRow}:AJ${currentRow + 1}`, "JUMLAH", {
        font: { name: "Calibri", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
      });

      currentRow++;
      for (let i = 1; i <= 31; i++) {
        const colIndex = 3 + i;
        const cell = worksheet.getCell(currentRow, colIndex);
        cell.value = i;
        cell.font = { name: "Calibri", size: 10, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      currentRow++;
      currentRow++; // Baris 42 kosong

      // Header kolom kanan
      worksheet.getCell(`AI${currentRow}`).value = "total trip";
      worksheet.getCell(`AI${currentRow}`).font = {
        name: "Calibri",
        size: 10,
        bold: true,
      };
      worksheet.getCell(`AK${currentRow}`).value = "tidak ops";
      worksheet.getCell(`AK${currentRow}`).font = {
        name: "Calibri",
        size: 10,
        bold: true,
      };
      worksheet.getCell(`AL${currentRow}`).value = "hari ops";
      worksheet.getCell(`AL${currentRow}`).font = {
        name: "Calibri",
        size: 10,
        bold: true,
      };
      currentRow++;

      kapalAsdpLembarPadangbai.forEach((kapal) => {
        const startRow = currentRow;

        mergeAndStyle(`C${startRow}:C${startRow + 2}`, kapal.nama, {
          font: { name: "Calibri", size: 10, bold: true },
          alignment: { horizontal: "center", vertical: "middle" },
        });

        const tripDataPerArah = tripPerKapalPerTanggalPerArah[kapal.nama] || {
          asalTujuan: {},
          tujuanAsal: {},
        };

        let totalAsalTujuan = 0;
        let hariOpsAsalTujuan = 0;
        for (let i = 1; i <= 31; i++) {
          const colIndex = 3 + i;
          const cell = worksheet.getCell(startRow, colIndex);
          const trip = tripDataPerArah.asalTujuan[i] || 0;

          cell.font = { name: "Calibri", size: 10 };
          cell.value = trip;
          cell.alignment = { horizontal: "center", vertical: "middle" };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
          };

          totalAsalTujuan += trip;
          if (trip > 0) hariOpsAsalTujuan++;
        }

        let totalTujuanAsal = 0;
        let hariOpsTujuanAsal = 0;
        for (let i = 1; i <= 31; i++) {
          const colIndex = 3 + i;
          const cell = worksheet.getCell(startRow + 1, colIndex);
          const trip = tripDataPerArah.tujuanAsal[i] || 0;

          cell.font = { name: "Calibri", size: 10 };
          cell.value = trip;
          cell.alignment = { horizontal: "center", vertical: "middle" };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ff0070c0" },
          };

          totalTujuanAsal += trip;
          if (trip > 0) hariOpsTujuanAsal++;
        }

        for (let i = 1; i <= 31; i++) {
          const colIndex = 3 + i;
          const cell = worksheet.getCell(startRow + 2, colIndex);
          const colLetter = getColumnLetter(colIndex);
          cell.value = {
            formula: `${colLetter}${startRow}+${colLetter}${startRow + 1}`,
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        const hariOps = Math.max(
          hariOpsAsalTujuan,
          hariOpsTujuanAsal,
        );

        worksheet.getCell(`AI${startRow}`).value = {
          formula: `SUM(D${startRow}:AH${startRow})`,
        };
        worksheet.getCell(`AI${startRow + 1}`).value = {
          formula: `SUM(D${startRow + 1}:AH${startRow + 1})`,
        };
        worksheet.getCell(`AI${startRow + 2}`).value = {
          formula: `SUM(D${startRow + 2}:AH${startRow + 2})`,
        };

        // Label arah dinamis (singkatan pelabuhan)
        const labelAsal = pelabuhanAsal.substring(0, 3).toUpperCase();
        const labelTujuan = pelabuhanTujuan.substring(0, 3).toUpperCase();

        const cellAsal = worksheet.getCell(`AJ${startRow}`);
        cellAsal.value = labelAsal;
        cellAsal.alignment = { horizontal: "center", vertical: "middle" };

        const cellTujuan = worksheet.getCell(`AJ${startRow + 1}`);
        cellTujuan.value = labelTujuan;
        cellTujuan.alignment = { horizontal: "center", vertical: "middle" };

        const cellGabungan = worksheet.getCell(`AJ${startRow + 2}`);
        cellGabungan.value = `${labelAsal} & ${labelTujuan}`;
        cellGabungan.alignment = { horizontal: "center", vertical: "middle" };

        worksheet.getCell(`AK${startRow}`).value = {
          formula: `COUNTIF(D${startRow}:AH${startRow},0)`,
        };

        worksheet.getCell(`AK${startRow + 1}`).value = {
          formula: `COUNTIF(D${startRow + 1}:AH${startRow + 1},0)`,
        };

        worksheet.getCell(`AK${startRow + 2}`).value = {
          formula: `COUNTIF(D${startRow + 2}:AH${startRow + 2},0)`,
        };

        worksheet.getCell(`AL${startRow}`).value = {
          formula: `$AH$41-AK${startRow}`,
        };

        worksheet.getCell(`AL${startRow + 1}`).value = {
          formula: `$AH$41-AK${startRow + 1}`,
        };

        worksheet.getCell(`AL${startRow + 2}`).value = {
          formula: `$AH$41-AK${startRow + 2}`,
        };

        currentRow += 3;
        currentRow++;
      });

      worksheet.getColumn(1).width = 5;
      worksheet.getColumn(2).width = 5;
      worksheet.getColumn(3).width = 25;
      for (let i = 4; i <= 34; i++) {
        worksheet.getColumn(i).width = 4;
      }
      worksheet.getColumn(35).width = 8; // AI
      worksheet.getColumn(36).width = 8; // AJ
      worksheet.getColumn(37).width = 8; // AK
      worksheet.getColumn(38).width = 8; // AL
      worksheet.getColumn(39).width = 8; // AM
      worksheet.views = [{ showGridLines: false }];

      worksheet.pageSetup = {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      };

      const worksheet2 = workbook.addWorksheet("Pengantar");
      worksheet2.properties.defaultFont = { name: "Frutiger-Normal", size: 11 };
      worksheet2.properties.tabColor = { argb: "FF00B050" };

      const dataPerKapal = {};

      kapalAsdpLembarPadangbai.forEach((kapal) => {
        const tripDataPerArah = tripPerKapalPerTanggalPerArah[kapal.nama] || {
          asalTujuan: {},
          tujuanAsal: {},
        };

        const tanggalDenganTrip = new Set();
        Object.keys(tripDataPerArah.asalTujuan).forEach((tgl) => {
          if (tripDataPerArah.asalTujuan[tgl] > 0)
            tanggalDenganTrip.add(tgl);
        });
        Object.keys(tripDataPerArah.tujuanAsal).forEach((tgl) => {
          if (tripDataPerArah.tujuanAsal[tgl] > 0)
            tanggalDenganTrip.add(tgl);
        });

        const hariOperasi = tanggalDenganTrip.size;
        const totalTrip =
          Object.values(tripDataPerArah.asalTujuan).reduce(
            (sum, val) => sum + val,
            0,
          ) +
          Object.values(tripDataPerArah.tujuanAsal).reduce(
            (sum, val) => sum + val,
            0,
          );

        const produksiKapal = produksiAsdp.filter((p) => {
          let namaKapal = p.nama_kapal.toUpperCase();
          if (namaKapal.startsWith("KMP.")) {
            namaKapal = namaKapal.substring(4).trim();
          }
          return namaKapal === kapal.nama;
        });

        const totalPenumpang = produksiKapal.reduce(
          (sum, p) => sum + (p.total_penumpang || 0),
          0,
        );
        const totalKendaraan = produksiKapal.reduce(
          (sum, p) => sum + (p.total_kendaraan || 0),
          0,
        );
        const totalPendapatanPenumpang = produksiKapal.reduce(
          (sum, p) => sum + (parseFloat(p.total_pendapatan_penumpang) || 0),
          0,
        );
        const totalPendapatanKendaraan = produksiKapal.reduce(
          (sum, p) => sum + (parseFloat(p.total_pendapatan_kendaraan) || 0),
          0,
        );

        dataPerKapal[kapal.nama] = {
          hariOperasi,
          totalTrip,
          totalPenumpang,
          totalKendaraan,
          totalPendapatanPenumpang,
          totalPendapatanKendaraan,
        };
      });

      const tanggalSurat = new Date(tanggalSampai);
      tanggalSurat.setDate(tanggalSurat.getDate() + 1);
      const hariSurat = tanggalSurat.getDate();
      const bulanSurat = bulanNama[tanggalSurat.getMonth()];
      const tahunSurat = tanggalSurat.getFullYear();

      // HEADER SURAT (dinamis berdasarkan pelabuhan asal)
      worksheet2.getCell("H29").value =
        `${pelabuhanAsal}, ${String(hariSurat).padStart(2, "0")} ${bulanSurat} ${tahunSurat}`;
      worksheet2.getCell("H29").alignment = {
        horizontal: "left",
        vertical: "top",
      };

      worksheet2.getCell("B30").value = "Lampiran";
      worksheet2.getCell("C30").value = ":";
      worksheet2.getCell("D30").value = "1 (satu) berkas.";

      worksheet2.getCell("B31").value = "Perihal";
      worksheet2.getCell("C31").value = ":";
      worksheet2.mergeCells("D31:F32");
      worksheet2.getCell("D31").value =
        `Laporan Bulanan Produksi dan Pendapatan Kapal\nBulan ${bulan} ${tahun}`;
      worksheet2.getCell("D31").alignment = { wrapText: true, vertical: "top" };

      worksheet2.getCell("G33").value = "Yth.";
      worksheet2.getCell("H32").value = "K e p a d a";
      worksheet2.getCell("H33").value = "Direktur Komersil";
      worksheet2.getCell("H33").font = { bold: true };
      worksheet2.getCell("H34").value = "PT. ASDP Indonesia Ferry (Persero)";
      worksheet2.getCell("H34").font = { bold: true };
      worksheet2.getCell("H35").value = "di";
      worksheet2.mergeCells("H36:J36");
      worksheet2.getCell("H36").value = "J A K A R T A";
      worksheet2.getCell("H36").font = { bold: true };
      worksheet2.getCell("H36").alignment = {
        horizontal: "center",
        vertical: "top",
      };

      worksheet2.getCell("C39").value = "1.";

      worksheet2.mergeCells("D39:M39");
      worksheet2.getCell("D39").value =
        `Bersama ini terlampir disampaikan laporan Produksi dan Pendapatan Kapal (Penyeberangan) Bulan ${bulan} ${tahun} sebagai berikut :`;
      worksheet2.getCell("D39").alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };

      worksheet2.getCell("D40").value = "a.";
      worksheet2.mergeCells("E40:M40");
      worksheet2.getCell("E40").value =
        `Laporan Produksi dan Pendapatan Kapal (Penyeberangan) Bulan ${bulan} sebagai berikut :`;
      worksheet2.getCell("E40").alignment = {
        wrapText: true,
        vertical: "top",
      };
      worksheet2.getCell("E40").font = {
        bold: true,
      };

      worksheet2.mergeCells("E42:E43");
      worksheet2.getCell("E42").value = "No";
      worksheet2.getCell("E42").font = { bold: true };
      worksheet2.getCell("E42").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("E42"), "thin");

      worksheet2.mergeCells("F42:F43");
      worksheet2.getCell("F42").value = "Uraian";
      worksheet2.getCell("F42").font = { bold: true };
      worksheet2.getCell("F42").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("F42"), "thin");

      worksheet2.mergeCells("G42:G43");
      worksheet2.getCell("G42").value = `RKA ${tahun}`;
      worksheet2.getCell("G42").font = { bold: true };
      worksheet2.getCell("G42").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("G42"), "thin");

      worksheet2.mergeCells("H42:H43");
      worksheet2.getCell("H42").value = `REALISASI ${tahun}`;
      worksheet2.getCell("H42").font = { bold: true };
      worksheet2.getCell("H42").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("H42"), "thin");

      worksheet2.mergeCells("I42:M42");
      worksheet2.getCell("I42").value = "Deviasi";
      worksheet2.getCell("I42").font = { bold: true };
      worksheet2.getCell("I42").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("I42"), "thin");

      // Baris 43
      worksheet2.mergeCells("I43:J43");
      worksheet2.getCell("I43").value = "( 4 - 3 )";
      worksheet2.getCell("I43").font = { bold: true };
      worksheet2.getCell("I43").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("I43"), "thin");

      worksheet2.mergeCells("K43:M43");
      worksheet2.getCell("K43").value = "( 4 / 3 ) %";
      worksheet2.getCell("K43").font = { bold: true };
      worksheet2.getCell("K43").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("K43"), "thin");

      // Baris 44: Nomor kolom
      worksheet2.getCell("E44").value = "1";
      worksheet2.getCell("E44").font = { bold: true };
      worksheet2.getCell("E44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("E44"), "thin");

      worksheet2.getCell("F44").value = "2";
      worksheet2.getCell("F44").font = { bold: true };
      worksheet2.getCell("F44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("F44"), "thin");

      worksheet2.getCell("G44").value = "3";
      worksheet2.getCell("G44").font = { bold: true };
      worksheet2.getCell("G44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("G44"), "thin");

      worksheet2.getCell("H44").value = "4";
      worksheet2.getCell("H44").font = { bold: true };
      worksheet2.getCell("H44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("H44"), "thin");

      worksheet2.mergeCells("I44:J44");
      worksheet2.getCell("I44").value = "5";
      worksheet2.getCell("I44").font = { bold: true };
      worksheet2.getCell("I44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("I44"), "thin");

      worksheet2.mergeCells("K44:M44");
      worksheet2.getCell("K44").value = "6";
      worksheet2.getCell("K44").font = { bold: true };
      worksheet2.getCell("K44").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell("K44"), "thin");

      // Header Produksi - E45 kosong, F45 ada tulisan, semua E-M kuning
      for (let col = 5; col <= 13; col++) {
        // E=5, M=13
        const cell = worksheet2.getCell(45, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };
        setBorder(cell, "thin");
      }
      worksheet2.getCell("F45").value = "Produksi";
      worksheet2.getCell("F45").font = { bold: true };
      worksheet2.getCell("F45").alignment = {
        horizontal: "left",
        vertical: "middle",
      };

      const addKapalData = (
        startRow,
        huruf,
        namaKapal,
        data,
        namaSheetKapal,
      ) => {
        worksheet2.getCell(`E${startRow}`).value = huruf;
        worksheet2.getCell(`E${startRow}`).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        setBorder(worksheet2.getCell(`E${startRow}`), "thin");

        worksheet2.getCell(`F${startRow}`).value = `Kmp. ${namaKapal}`;
        worksheet2.getCell(`F${startRow}`).font = { bold: true };
        worksheet2.getCell(`F${startRow}`).alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        setBorder(worksheet2.getCell(`F${startRow}`), "thin");

        ["G", "H", "I", "J", "K", "L", "M"].forEach((col) => {
          setBorder(worksheet2.getCell(`${col}${startRow}`), "thin");
        });

        const details = [
          { label: "- Hari Operasi", refRow: 21 },
          { label: "- Trip", refRow: 22 },
          { label: "- Penumpang", refRow: 48 },
          { label: "- Kendaraan", refRow: 75 },
        ];

        details.forEach((detail, idx) => {
          const row = startRow + 1 + idx;

          worksheet2.getCell(`E${row}`).value = "";
          setBorder(worksheet2.getCell(`E${row}`), "thin");

          worksheet2.getCell(`F${row}`).value = detail.label;
          worksheet2.getCell(`F${row}`).alignment = {
            horizontal: "left",
            vertical: "middle",
          };
          setBorder(worksheet2.getCell(`F${row}`), "thin");

          // Referensi ke sheet kapal gabungan kolom E (RKA/Rencana)
          worksheet2.getCell(`G${row}`).value = {
            formula: `+'${namaSheetKapal}'!E${detail.refRow}`,
          };
          worksheet2.getCell(`G${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`G${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`G${row}`), "thin");

          // Referensi ke sheet kapal gabungan kolom F (Realisasi)
          worksheet2.getCell(`H${row}`).value = {
            formula: `+'${namaSheetKapal}'!F${detail.refRow}`,
          };
          worksheet2.getCell(`H${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`H${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`H${row}`), "thin");

          worksheet2.mergeCells(`I${row}:J${row}`);
          worksheet2.getCell(`I${row}`).value = { formula: `H${row}-G${row}` };
          worksheet2.getCell(`I${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`I${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`I${row}`), "thin");

          worksheet2.mergeCells(`K${row}:M${row}`);
          worksheet2.getCell(`K${row}`).value = {
            formula: `IF(G${row}=0,"",H${row}/G${row})`,
          };
          worksheet2.getCell(`K${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`K${row}`).numFmt = "0.00%";
          setBorder(worksheet2.getCell(`K${row}`), "thin");
        });
      };

      // Fungsi helper untuk mendapatkan nama pendek kapal
      const getNamaPendekKpl = (namaKapal) => {
        let n = String(namaKapal).trim();
        if (n.toUpperCase().startsWith("KMP.")) n = n.substring(4).trim();
        return n
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
      };

      let currentRow2 = 46;
      // Generate huruf untuk semua kapal (A, B, C, D, E, ...)
      const hurufKapal = kapalAsdpLembarPadangbai.map(
        (_, idx) => String.fromCharCode(65 + idx), // 65 = 'A'
      );
      const kapalTerpilih = kapalAsdpLembarPadangbai; // Ambil semua kapal

      kapalTerpilih.forEach((kapal, idx) => {
        const data = dataPerKapal[kapal.nama] || {
          hariOperasi: 0,
          totalTrip: 0,
          totalPenumpang: 0,
          totalKendaraan: 0,
          totalPendapatanPenumpang: 0,
          totalPendapatanKendaraan: 0,
        };

        // Buat nama sheet gabungan untuk kapal ini (dinamis)
        const np = getNamaPendekKpl(kapal.nama);
        const labelAsalShort = pelabuhanAsal.substring(0, 3).toUpperCase();
        const labelTujuanShort = pelabuhanTujuan.substring(0, 3).toUpperCase();
        const namaSheetKapal = `${np}-${labelAsalShort}-${labelTujuanShort}`.substring(0, 31);

        addKapalData(
          currentRow2,
          hurufKapal[idx],
          kapal.nama,
          data,
          namaSheetKapal,
        );
        currentRow2 += 5;
      });

      const addPendapatanKapal = (
        startRow,
        huruf,
        namaKapal,
        data,
        namaSheetKapal,
      ) => {
        worksheet2.getCell(`E${startRow}`).value = huruf;
        worksheet2.getCell(`E${startRow}`).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        setBorder(worksheet2.getCell(`E${startRow}`), "thin");

        worksheet2.getCell(`F${startRow}`).value = `Kmp. ${namaKapal}`;
        worksheet2.getCell(`F${startRow}`).font = { bold: true };
        worksheet2.getCell(`F${startRow}`).alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        setBorder(worksheet2.getCell(`F${startRow}`), "thin");

        ["G", "H", "I", "J", "K", "L", "M"].forEach((col) => {
          setBorder(worksheet2.getCell(`${col}${startRow}`), "thin");
        });

        const details = [
          { label: "- Penumpang", refRow: 48 },
          { label: "- Kendaraan", refRow: 75 },
        ];

        details.forEach((detail, idx) => {
          const row = startRow + 1 + idx;

          worksheet2.getCell(`E${row}`).value = "";
          setBorder(worksheet2.getCell(`E${row}`), "thin");

          worksheet2.getCell(`F${row}`).value = detail.label;
          worksheet2.getCell(`F${row}`).alignment = {
            horizontal: "left",
            vertical: "middle",
          };
          setBorder(worksheet2.getCell(`F${row}`), "thin");

          // Referensi ke sheet kapal gabungan kolom I (rencana pendapatan)
          worksheet2.getCell(`G${row}`).value = {
            formula: `+'${namaSheetKapal}'!I${detail.refRow}`,
          };
          worksheet2.getCell(`G${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`G${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`G${row}`), "thin");

          // Referensi ke sheet kapal gabungan kolom J (realisasi pendapatan)
          worksheet2.getCell(`H${row}`).value = {
            formula: `+'${namaSheetKapal}'!J${detail.refRow}`,
          };
          worksheet2.getCell(`H${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`H${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`H${row}`), "thin");

          worksheet2.mergeCells(`I${row}:J${row}`);
          worksheet2.getCell(`I${row}`).value = { formula: `H${row}-G${row}` };
          worksheet2.getCell(`I${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`I${row}`).numFmt = "#,##0";
          setBorder(worksheet2.getCell(`I${row}`), "thin");

          worksheet2.mergeCells(`K${row}:M${row}`);
          worksheet2.getCell(`K${row}`).value = {
            formula: `IF(G${row}=0,"",H${row}/G${row})`,
          };
          worksheet2.getCell(`K${row}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          worksheet2.getCell(`K${row}`).numFmt = "0.00%";
          setBorder(worksheet2.getCell(`K${row}`), "thin");
        });

        const jumlahRow = startRow + 3;
        worksheet2.getCell(`E${jumlahRow}`).value = "";
        setBorder(worksheet2.getCell(`E${jumlahRow}`), "thin");

        worksheet2.getCell(`F${jumlahRow}`).value = `Jumlah-${huruf}`;
        worksheet2.getCell(`F${jumlahRow}`).font = { bold: true };
        worksheet2.getCell(`F${jumlahRow}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        setBorder(worksheet2.getCell(`F${jumlahRow}`), "thin");

        worksheet2.getCell(`G${jumlahRow}`).value = {
          formula: `SUM(G${startRow + 1}:G${startRow + 2})`,
        };
        worksheet2.getCell(`G${jumlahRow}`).font = { bold: true };
        worksheet2.getCell(`G${jumlahRow}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        worksheet2.getCell(`G${jumlahRow}`).numFmt = "#,##0";
        setBorder(worksheet2.getCell(`G${jumlahRow}`), "thin");

        worksheet2.getCell(`H${jumlahRow}`).value = {
          formula: `SUM(H${startRow + 1}:H${startRow + 2})`,
        };
        worksheet2.getCell(`H${jumlahRow}`).font = { bold: true };
        worksheet2.getCell(`H${jumlahRow}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        worksheet2.getCell(`H${jumlahRow}`).numFmt = "#,##0";
        setBorder(worksheet2.getCell(`H${jumlahRow}`), "thin");

        worksheet2.mergeCells(`I${jumlahRow}:J${jumlahRow}`);
        worksheet2.getCell(`I${jumlahRow}`).value = {
          formula: `H${jumlahRow}-G${jumlahRow}`,
        };
        worksheet2.getCell(`I${jumlahRow}`).font = { bold: true };
        worksheet2.getCell(`I${jumlahRow}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        worksheet2.getCell(`I${jumlahRow}`).numFmt = "#,##0";
        setBorder(worksheet2.getCell(`I${jumlahRow}`), "thin");

        worksheet2.mergeCells(`K${jumlahRow}:M${jumlahRow}`);
        worksheet2.getCell(`K${jumlahRow}`).value = {
          formula: `IF(G${jumlahRow}=0,"",H${jumlahRow}/G${jumlahRow})`,
        };
        worksheet2.getCell(`K${jumlahRow}`).font = { bold: true };
        worksheet2.getCell(`K${jumlahRow}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        worksheet2.getCell(`K${jumlahRow}`).numFmt = "0.00%";
        setBorder(worksheet2.getCell(`K${jumlahRow}`), "thin");
      };

      // Header Pendapatan - posisi dinamis
      const headerPendapatanRow = 46 + kapalAsdpLembarPadangbai.length * 5;

      // E kosong, F ada tulisan, semua E-M kuning
      for (let col = 5; col <= 13; col++) {
        // E=5, M=13
        const cell = worksheet2.getCell(headerPendapatanRow, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };
        setBorder(cell, "thin");
      }
      worksheet2.getCell(`F${headerPendapatanRow}`).value = "Pendapatan";
      worksheet2.getCell(`F${headerPendapatanRow}`).font = { bold: true };
      worksheet2.getCell(`F${headerPendapatanRow}`).alignment = {
        horizontal: "left",
        vertical: "middle",
      };

      // DATA PENDAPATAN PER KAPAL
      // Hitung currentRow2 berdasarkan posisi header pendapatan
      currentRow2 = headerPendapatanRow + 1; // Mulai dari baris setelah header

      kapalAsdpLembarPadangbai.forEach((kapal, idx) => {
        const data = dataPerKapal[kapal.nama] || {
          totalPendapatanPenumpang: 0,
          totalPendapatanKendaraan: 0,
        };

        // Buat nama sheet gabungan untuk kapal ini (dinamis)
        const np = getNamaPendekKpl(kapal.nama);
        const labelAsalShort = pelabuhanAsal.substring(0, 3).toUpperCase();
        const labelTujuanShort = pelabuhanTujuan.substring(0, 3).toUpperCase();
        const namaSheetKapal = `${np}-${labelAsalShort}-${labelTujuanShort}`.substring(0, 31);

        addPendapatanKapal(
          currentRow2,
          hurufKapal[idx],
          kapal.nama,
          data,
          namaSheetKapal,
        );
        currentRow2 += 4;
      });

      // Baris Jumlah Total - dinamis berdasarkan jumlah kapal
      const jumlahTotalRow = currentRow2;

      worksheet2.getCell(`E${jumlahTotalRow}`).value = "";
      setBorder(worksheet2.getCell(`E${jumlahTotalRow}`), "thin");

      // Generate formula jumlah dinamis (A+B+C+D+...)
      const hurufFormula = hurufKapal.join("+");
      worksheet2.getCell(`F${jumlahTotalRow}`).value =
        `Jumlah (${hurufFormula})`;
      worksheet2.getCell(`F${jumlahTotalRow}`).font = { bold: true };
      worksheet2.getCell(`F${jumlahTotalRow}`).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      setBorder(worksheet2.getCell(`F${jumlahTotalRow}`), "thin");

      // Generate formula SUM untuk semua kapal
      const rowJumlahKapal = kapalAsdpLembarPadangbai.map((_, idx) => {
        const startRow = 46 + idx * 5 + 1 + 16; // 62 untuk kapal pertama
        return startRow + 3; // baris jumlah untuk setiap kapal
      });

      const g74Formula = rowJumlahKapal.map((r) => `G${r}`).join("+");
      const h74Formula = rowJumlahKapal.map((r) => `H${r}`).join("+");

      worksheet2.getCell(`G${jumlahTotalRow}`).value = { formula: g74Formula };
      worksheet2.getCell(`G${jumlahTotalRow}`).font = { bold: true };
      worksheet2.getCell(`G${jumlahTotalRow}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      worksheet2.getCell(`G${jumlahTotalRow}`).numFmt = "#,##0";
      setBorder(worksheet2.getCell(`G${jumlahTotalRow}`), "thin");

      worksheet2.getCell(`H${jumlahTotalRow}`).value = { formula: h74Formula };
      worksheet2.getCell(`H${jumlahTotalRow}`).font = { bold: true };
      worksheet2.getCell(`H${jumlahTotalRow}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      worksheet2.getCell(`H${jumlahTotalRow}`).numFmt = "#,##0";
      setBorder(worksheet2.getCell(`H${jumlahTotalRow}`), "thin");

      worksheet2.mergeCells(`I${jumlahTotalRow}:J${jumlahTotalRow}`);
      worksheet2.getCell(`I${jumlahTotalRow}`).value = {
        formula: `H${jumlahTotalRow}-G${jumlahTotalRow}`,
      };
      worksheet2.getCell(`I${jumlahTotalRow}`).font = { bold: true };
      worksheet2.getCell(`I${jumlahTotalRow}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      worksheet2.getCell(`I${jumlahTotalRow}`).numFmt = "#,##0";
      setBorder(worksheet2.getCell(`I${jumlahTotalRow}`), "thin");

      worksheet2.mergeCells(`K${jumlahTotalRow}:M${jumlahTotalRow}`);
      worksheet2.getCell(`K${jumlahTotalRow}`).value = {
        formula: `IF(G${jumlahTotalRow}=0,"",H${jumlahTotalRow}/G${jumlahTotalRow})`,
      };
      worksheet2.getCell(`K${jumlahTotalRow}`).font = { bold: true };
      worksheet2.getCell(`K${jumlahTotalRow}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      worksheet2.getCell(`K${jumlahTotalRow}`).numFmt = "0.00%";
      setBorder(worksheet2.getCell(`K${jumlahTotalRow}`), "thin");

      // Bagian penutup - posisi dinamis
      const row76 = jumlahTotalRow + 3;
      const row78 = jumlahTotalRow + 5;
      const row83 = jumlahTotalRow + 10;
      const row85 = jumlahTotalRow + 12;

      worksheet2.getCell(`D${row76}`).value = "2.";
      worksheet2.mergeCells(`E${row76}:M${row76}`);
      worksheet2.getCell(`E${row76}`).value =
        "Demikian atas perhatian Direksi di ucapkan terima kasih.";
      worksheet2.getCell(`E${row76}`).alignment = {
        wrapText: true,
        vertical: "top",
      };

      worksheet2.mergeCells(`H${row78}:J${row78}`);
      worksheet2.getCell(`H${row78}`).value = "GENERAL MANAGER";
      worksheet2.getCell(`H${row78}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet2.mergeCells(`H${row83}:J${row83}`);
      worksheet2.getCell(`H${row83}`).value = suratDokumen.general_manager;
      worksheet2.getCell(`H${row83}`).font = { bold: true, underline: true };
      worksheet2.getCell(`H${row83}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet2.getCell(`B${row85}`).value = "Tembusan Yth :";
      worksheet2.getCell(`B${row85 + 1}`).value = "1. Direktur Utama";
      worksheet2.getCell(`B${row85 + 2}`).value = "2. Direktur Keuangan";
      worksheet2.getCell(`B${row85 + 3}`).value = "3. Kepala SPI";
      worksheet2.getColumn(1).width = 3;
      worksheet2.getColumn(2).width = 15;
      worksheet2.getColumn(3).width = 5;
      worksheet2.getColumn(4).width = 5;
      worksheet2.getColumn(5).width = 5;
      worksheet2.getColumn(6).width = 30;
      worksheet2.getColumn(7).width = 15;
      worksheet2.getColumn(8).width = 15;
      worksheet2.getColumn(9).width = 0;
      worksheet2.getColumn(10).width = 20;
      worksheet2.getColumn(11).width = 0;
      worksheet2.getColumn(12).width = 0;
      worksheet2.getColumn(13).width = 25;

      worksheet2.views = [{ showGridLines: true }];
      worksheet2.pageSetup = {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      };

      // Gunakan rute_id yang dipilih user (sudah ada di variabel rute_id)
      // Untuk rute bolak-balik, cari rute pasangannya (asal-tujuan terbalik)
      let rutePasangan = null;
      try {
        // Cari rute dengan pelabuhan terbalik
        const allRutes = await RuteModel.getAll();
        rutePasangan = allRutes.find(r => 
          r.pelabuhan_asal_id === ruteData.pelabuhan_tujuan_id &&
          r.pelabuhan_tujuan_id === ruteData.pelabuhan_asal_id
        );
        if (rutePasangan) {
          console.log("Rute pasangan ditemukan:", rutePasangan.nama_rute);
        }
      } catch (e) {
        console.warn("Gagal mencari rute pasangan:", e.message);
      }

      const jarakRuteUtama = ruteData.jarak || 0;
      const jarakRutePasangan = rutePasangan?.jarak || jarakRuteUtama;

      const GOL_ROW_MAP = [
        { row: 49, nomor: 1, tipe: null },
        { row: 50, nomor: 2, tipe: null },
        { row: 51, nomor: 3, tipe: null },
        { row: 52, nomor: 4, tipe: "penumpang" },
        { row: 53, nomor: 4, tipe: "barang" },
        { row: 54, nomor: 5, tipe: "penumpang" },
        { row: 55, nomor: 5, tipe: "barang" },
        { row: 56, nomor: 6, tipe: "penumpang" },
        { row: 57, nomor: 6, tipe: "barang" },
        { row: 58, nomor: 7, tipe: null },
        { row: 59, nomor: 8, tipe: null },
        { row: 60, nomor: 9, tipe: null },
      ];

      // Query tarif berdasarkan rute_id yang dipilih user
      let tarifRuteUtama = [], tarifRutePasangan = [];
      try {
        tarifRuteUtama = await TarifKendaraanModel.getByRute(rute_id);
        console.log(`Tarif kendaraan rute ${namaRute}:`, tarifRuteUtama.length);
      } catch (e) {
        console.warn(`Gagal ambil tarif kendaraan rute ${namaRute}:`, e.message);
      }
      
      if (rutePasangan) {
        try {
          tarifRutePasangan = await TarifKendaraanModel.getByRute(rutePasangan.rute_id);
          console.log(`Tarif kendaraan rute pasangan:`, tarifRutePasangan.length);
        } catch (e) {
          console.warn("Gagal ambil tarif kendaraan rute pasangan:", e.message);
        }
      }

      // Ambil tarif penumpang dari database berdasarkan rute_id
      let tarifPenumpangRuteUtama = [], tarifPenumpangRutePasangan = [];
      try {
        tarifPenumpangRuteUtama = await TarifPenumpangModel.getByRute(rute_id);
        console.log(`Tarif penumpang rute ${namaRute}:`, tarifPenumpangRuteUtama.length);
      } catch (e) {
        console.warn(`Gagal ambil tarif penumpang rute ${namaRute}:`, e.message);
      }
      
      if (rutePasangan) {
        try {
          tarifPenumpangRutePasangan = await TarifPenumpangModel.getByRute(rutePasangan.rute_id);
          console.log(`Tarif penumpang rute pasangan:`, tarifPenumpangRutePasangan.length);
        } catch (e) {
          console.warn("Gagal ambil tarif penumpang rute pasangan:", e.message);
        }
      }

      const cariTarif = (tarifArr, nomorGol, tipe) => {
        const found = tarifArr.find((t) => {
          const nMatch =
            parseInt(t.golongan?.nomor_golongan || t.nomor_golongan || 0) ===
            nomorGol;
          if (!tipe)
            return nMatch && !t.golongan?.tipe_muatan && !t.tipe_muatan;
          const tMatch = String(t.golongan?.tipe_muatan || t.tipe_muatan || "")
            .toLowerCase()
            .includes(tipe);
          return nMatch && tMatch;
        });
        return found ? found.tarif || 0 : 0;
      };

      // Fungsi untuk mencari tarif penumpang berdasarkan kategori
      const cariTarifPenumpang = (tarifArr, kategori) => {
        const found = tarifArr.find((t) => {
          const namaKategori = String(
            t.kategori?.nama_kategori || "",
          ).toLowerCase();
          return namaKategori.includes(kategori.toLowerCase());
        });
        return found ? found.tarif || 0 : 0;
      };

      // Tarif per row untuk rute utama dan pasangan
      const tarifPerRowRuteUtama = {};
      GOL_ROW_MAP.forEach((g) => {
        tarifPerRowRuteUtama[g.row] = cariTarif(tarifRuteUtama, g.nomor, g.tipe);
      });
      
      const tarifPerRowRutePasangan = {};
      GOL_ROW_MAP.forEach((g) => {
        tarifPerRowRutePasangan[g.row] = cariTarif(tarifRutePasangan, g.nomor, g.tipe);
      });
      
      const tarifPerRowGAB = tarifPerRowRuteUtama;

      // Tarif penumpang per rute (dinamis berdasarkan rute yang dipilih)
      const tarifPenumpangRuteUtamaObj = {
        dewasa: cariTarifPenumpang(tarifPenumpangRuteUtama, "dewasa"),
        anak: cariTarifPenumpang(tarifPenumpangRuteUtama, "bayi"),
      };
      
      const tarifPenumpangRutePasanganObj = {
        dewasa: cariTarifPenumpang(tarifPenumpangRutePasangan, "dewasa"),
        anak: cariTarifPenumpang(tarifPenumpangRutePasangan, "bayi"),
      };
      
      const tarifPenumpangGAB = tarifPenumpangRuteUtamaObj;

      const allProduksiIds = produksiAsdp.map((p) => p.produksi_id);
      const kendaraanPerProduksi = {};
      for (const pid of allProduksiIds) {
        try {
          kendaraanPerProduksi[pid] =
            await ProduksiKendaraanModel.getByProduksi(pid);
        } catch (e) {
          kendaraanPerProduksi[pid] = [];
        }
      }

      const penumpangPerProduksi = {};
      for (const pid of allProduksiIds) {
        try {
          penumpangPerProduksi[pid] =
            await ProduksiPenumpangModel.getByProduksi(pid);
        } catch (e) {
          penumpangPerProduksi[pid] = [];
        }
      }

      const hitungPenumpang = (produksiFiltArr) => {
        let dewasa = 0,
          bayi = 0;
        produksiFiltArr.forEach((p) => {
          const pArr = penumpangPerProduksi[p.produksi_id] || [];
          pArr.forEach((k) => {
            const nama = String(k.nama_kategori || "").toLowerCase();
            if (nama.includes("dewasa")) dewasa += k.jumlah || 0;
            else if (nama.includes("bayi")) bayi += k.jumlah || 0;
          });
        });
        return { dewasa, bayi };
      };

      // Fungsi baru: hitung penumpang dengan pemisahan normal dan diskon
      const hitungPenumpangDetail = (produksiFiltArr) => {
        const result = {
          dewasa: { normal: 0, diskon: 0, tarifNormal: 0, tarifDiskon: 0 },
          anak: { normal: 0, diskon: 0, tarifNormal: 0, tarifDiskon: 0 },
        };
        
        produksiFiltArr.forEach((p) => {
          const pArr = penumpangPerProduksi[p.produksi_id] || [];
          pArr.forEach((k) => {
            const nama = String(k.nama_kategori || "").toLowerCase();
            const jumlah = k.jumlah || 0;
            const tarif = k.tarif || 0;
            const isCustom = k.is_tarif_custom === true || k.is_tarif_custom === 1;
            
            if (nama.includes("dewasa")) {
              if (isCustom) {
                result.dewasa.diskon += jumlah;
                if (jumlah > 0 && result.dewasa.tarifDiskon === 0) {
                  result.dewasa.tarifDiskon = tarif;
                }
              } else {
                result.dewasa.normal += jumlah;
                if (jumlah > 0 && result.dewasa.tarifNormal === 0) {
                  result.dewasa.tarifNormal = tarif;
                }
              }
            } else if (nama.includes("bayi") || nama.includes("anak")) {
              if (isCustom) {
                result.anak.diskon += jumlah;
                if (jumlah > 0 && result.anak.tarifDiskon === 0) {
                  result.anak.tarifDiskon = tarif;
                }
              } else {
                result.anak.normal += jumlah;
                if (jumlah > 0 && result.anak.tarifNormal === 0) {
                  result.anak.tarifNormal = tarif;
                }
              }
            }
          });
        });
        
        return result;
      };

      const hitungKendaraan = (produksiFiltArr) => {
        const result = {};
        produksiFiltArr.forEach((p) => {
          const kndArr = kendaraanPerProduksi[p.produksi_id] || [];
          kndArr.forEach((k) => {
            const key = `${k.nomor_golongan}_${(k.tipe_muatan || "").toLowerCase()}`;
            result[key] = (result[key] || 0) + (k.jumlah || 0);
          });
        });
        return result;
      };

      // Fungsi baru: hitung kendaraan dengan pemisahan normal dan diskon
      const hitungKendaraanDetail = (produksiFiltArr) => {
        const result = {};
        
        produksiFiltArr.forEach((p) => {
          const kndArr = kendaraanPerProduksi[p.produksi_id] || [];
          kndArr.forEach((k) => {
            const key = `${k.nomor_golongan}_${(k.tipe_muatan || "").toLowerCase()}`;
            const jumlah = k.jumlah || 0;
            const tarif = k.tarif || 0;
            const isCustom = k.is_tarif_custom === true || k.is_tarif_custom === 1;
            
            if (!result[key]) {
              result[key] = {
                normal: 0,
                diskon: 0,
                tarifNormal: 0,
                tarifDiskon: 0,
              };
            }
            
            if (isCustom) {
              result[key].diskon += jumlah;
              if (jumlah > 0 && result[key].tarifDiskon === 0) {
                result[key].tarifDiskon = tarif;
              }
            } else {
              result[key].normal += jumlah;
              if (jumlah > 0 && result[key].tarifNormal === 0) {
                result[key].tarifNormal = tarif;
              }
            }
          });
        });
        
        return result;
      };

      const getKndKey = (g) => {
        if (!g.tipe) return `${g.nomor}_`;
        return `${g.nomor}_${g.tipe}`;
      };

      const buatSheetLaporan = (
        sheetName,
        namaKapalDisplay,
        namaKapalPendek,
        gt,
        kapasitasPnp,
        kapasitasKnd,
        arahRute,
        namaSheetLbr,
        namaSheetPdg,
        namaSheetGab,
        kapalIndex,
        jarakRute,
      ) => {
        const ws = workbook.addWorksheet(sheetName);
        ws.properties.defaultFont = { name: "Calibri", size: 11 };
        ws.properties.tabColor = { argb: "FF00B050" };

        const prodFilter = produksiAsdp.filter((p) => {
          if (namaKapalPendek) {
            let nk = p.nama_kapal.trim();
            if (nk.toUpperCase().startsWith("KMP."))
              nk = nk.substring(4).trim();
            const nkCapital = nk
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            if (nkCapital !== namaKapalPendek) return false;
          }
          // Filter per arah (dinamis berdasarkan pelabuhan)
          const asal = String(p.nama_pelabuhan_asal || "").toUpperCase();
          if (arahRute === "asal_tujuan") {
            return asal.includes(pelabuhanAsal.toUpperCase());
          }
          if (arahRute === "tujuan_asal") {
            return asal.includes(pelabuhanTujuan.toUpperCase());
          }
          return true; // gabungan
        });

        const totalTripAktual = prodFilter.length;
        const tanggalSet = new Set(
          prodFilter.map((p) => new Date(p.tanggal_produksi).toDateString()),
        );
        const hariOpsAktual = tanggalSet.size;
        const totalPnpAktual = prodFilter.reduce(
          (s, p) => s + (p.total_penumpang || 0),
          0,
        );
        const { dewasa: pnpDewasa, bayi: pnpBayi } =
          hitungPenumpang(prodFilter);

        // Hitung detail dengan pemisahan normal dan diskon
        const pnpDetail = hitungPenumpangDetail(prodFilter);
        const kndDetail = hitungKendaraanDetail(prodFilter);

        // Jumlah kendaraan per golongan
        const kndJumlah = hitungKendaraan(prodFilter);

        // Tarif per baris (dinamis berdasarkan rute)
        const tarifPerRow =
          arahRute === "asal_tujuan"
            ? tarifPerRowRuteUtama
            : arahRute === "tujuan_asal"
              ? tarifPerRowRutePasangan
              : tarifPerRowGAB;

        // Tarif penumpang per rute (dinamis)
        const tarifPenumpang =
          arahRute === "asal_tujuan"
            ? tarifPenumpangRuteUtamaObj
            : arahRute === "tujuan_asal"
              ? tarifPenumpangRutePasanganObj
              : tarifPenumpangGAB;

        // Lintasan dinamis berdasarkan rute
        const lintasan =
          arahRute === "asal_tujuan"
            ? `${pelabuhanAsal.toUpperCase()} - ${pelabuhanTujuan.toUpperCase()} / ${jarakRute} NM`
            : arahRute === "tujuan_asal"
              ? `${pelabuhanTujuan.toUpperCase()} - ${pelabuhanAsal.toUpperCase()} / ${jarakRute} NM`
              : jarakRute === "(gabungan)"
                ? `${namaRute.toUpperCase()} ${jarakRute}`
                : `${namaRute.toUpperCase()} / ${jarakRute} NM`;

        const isGabungan1 = arahRute === "gabungan1";
        const isGabunganSemua = arahRute === "gabunganSemua";
        const is1Arah = arahRute === "asal_tujuan" || arahRute === "tujuan_asal";

        // Nama sheet gabungan dinamis
        const labelAsalShort = pelabuhanAsal.substring(0, 3).toUpperCase();
        const labelTujuanShort = pelabuhanTujuan.substring(0, 3).toUpperCase();
        
        const allGabSheets = kapalAsdpLembarPadangbai.map((k) => {
          const np = getNamaPendekKpl(k.nama);
          return `${np}-${labelAsalShort}-${labelTujuanShort}`.substring(0, 31);
        });
        const sumEFormula = (row) =>
          allGabSheets.map((s) => `'${s}'!E${row}`).join("+");
        const sumFFormula = (row) =>
          allGabSheets.map((s) => `'${s}'!F${row}`).join("+");
        const sumIFormula = (row) =>
          allGabSheets.map((s) => `'${s}'!I${row}`).join("+");
        const sumJFormula = (row) =>
          allGabSheets.map((s) => `'${s}'!J${row}`).join("+");

        const b = (cell, s = "thin") => {
          cell.border = {
            top: { style: s },
            left: { style: s },
            bottom: { style: s },
            right: { style: s },
          };
        };

        const bOuter = (r1, c1, r2, c2, s = "medium") => {
          for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++) {
              const cell = ws.getCell(r, c);
              const cur = cell.border || {};
              cell.border = {
                top: r === r1 ? { style: s } : cur.top || {},
                bottom: r === r2 ? { style: s } : cur.bottom || {},
                left: c === c1 ? { style: s } : cur.left || {},
                right: c === c2 ? { style: s } : cur.right || {},
              };
            }
        };
        const sc = (addr, val, opts = {}) => {
          const c = ws.getCell(addr);
          if (val !== undefined) c.value = val;
          if (opts.bold)
            c.font = { name: "Calibri", size: opts.size || 11, bold: true };
          if (opts.align) c.alignment = opts.align;
          if (opts.border) b(c, opts.border);
          if (opts.numFmt) c.numFmt = opts.numFmt;
          return c;
        };
        const mc = (range, val, opts = {}) => {
          try {
            ws.mergeCells(range);
          } catch (e) {}
          return sc(range.split(":")[0], val, opts);
        };

        const rencE = (row) => {
          if (isGabunganSemua && row !== 20)
            return { formula: sumEFormula(row) };
          if (!is1Arah || !namaSheetGab || row === 20) return "";
          return {
            formula: `IF(OR('${namaSheetGab}'!E${row}=0,'${namaSheetGab}'!E${row}=""),"",'${namaSheetGab}'!E${row}/2)`,
          };
        };

        const realFGab1 = (row) => {
          if (isGabunganSemua) return { formula: sumFFormula(row) };
          if (!isGabungan1 || !namaSheetLbr || !namaSheetPdg) return null;
          return {
            formula: `'${namaSheetLbr}'!F${row}+'${namaSheetPdg}'!F${row}`,
          };
        };

        const realJFormula = (row) => {
          if (isGabunganSemua) return sumJFormula(row);
          if (isGabungan1 && namaSheetLbr && namaSheetPdg)
            return `'${namaSheetLbr}'!J${row}+'${namaSheetPdg}'!J${row}`;
          return `F${row}*D${row}`;
        };

        [4, 6, 25, 15, 12, 12, 7, 7, 18, 18, 10, 10].forEach(
          (w, i) => (ws.getColumn(i + 1).width = w),
        );

        bOuter(2, 2, 5, 3, "thin");
        const logoPath = path.join(__dirname, "../public/images/logo_asdp.png");
        const logoId = workbook.addImage({
          filename: logoPath,
          extension: "png",
        });
        ws.addImage(logoId, {
          tl: { col: 2.5, row: 1.2 },
          ext: { width: 70, height: 70 },
          editAs: "absolute",
        });
        mc("D3:I4", "LAPORAN PRODUKSI\nDAN PENDAPATAN KAPAL BULANAN ", {
          bold: true,
          size: 14,
          wrapText: true,
          align: { horizontal: "center", vertical: "middle" },
        });

        bOuter(2, 4, 5, 9, "thin");

        sc("J2", "No Dokumen");
        sc("K2", `: ${suratDokumen.no_dokumen || ""}`);
        sc("J3", "Revisi");
        sc("K3", `: ${suratDokumen.revisi || ""}`);
        sc("J4", "Berlaku Efektif");
        sc("K4", ":");
        sc("J5", "Halaman");
        sc("K5", `: ${suratDokumen.halaman || "1 dari 1"}`);
        bOuter(2, 10, 5, 12, "thin");

        sc("B7", "CABANG", { bold: true, size: 14 });
        sc("D7", `: ${pelabuhanAsal.toUpperCase()}`, { bold: true, size: 14 });
        sc("B8", "USAHA", { bold: true, size: 14 });
        sc("D8", ": BISNIS PENYEBERANGAN", { bold: true, size: 14 });
        sc("B9", "BULAN", { bold: true, size: 14 });
        sc("D9", `: ${bulan.toUpperCase()} ${tahun}`, { bold: true, size: 14 });
        sc("J9", "BULANAN", {
          name: "Times New Roman",
          bold: true,
          border: "thin",
          align: { horizontal: "center", vertical: "middle" },
        });
        sc("B10", "LINTASAN / JARAK", { bold: true, size: 14 });
        sc("D10", `: ${lintasan}`, { bold: true, size: 14 });
        sc("B11", "NAMA KAPAL / GRT", { bold: true, size: 14 });
        const gtFormatted =
          gt && gt !== "0" ? `(${Math.round(parseFloat(gt))})` : "";
        sc("D11", `: ${namaKapalDisplay} ${gtFormatted}`, {
          bold: true,
          size: 14,
        });
        sc("B12", "KAPASITAS ANGKUT", { bold: true, size: 14 });
        sc(
          "D12",
          `a. Penumpang: ${kapasitasPnp} org, -Kendaraan: ${kapasitasKnd} unit (campuran)`,
          { bold: true, size: 11 },
        );

        ["D", "E", "F", "G", "H", "I", "J", "K", "L"].forEach((col, i) => {
          const labels = [
            "Eks",
            "Bis.I",
            "Bis.II",
            "Eko.",
            "Gol IV",
            "Gol V",
            "Gol VI",
            "Gol VII",
            "Gol VIII",
          ];
          const cell14 = sc(`${col}14`, labels[i], {
            border: "thin",
            align: { horizontal: "center", vertical: "middle" },
          });
          cell14.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ffccffff" },
          };
          cell14.font = {
            name: "Calibri",
            size: 11,
          };
          sc(`${col}15`, "", { border: "thin" });
        });

        const blueHeaderFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ffccffff" },
        };
        const blueHeaderFont = {
          name: "Calibri",
          size: 11,
          bold: true,
        };

        const yellowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };

        // F20:F22
        ["F20", "F21", "F22"].forEach(
          (addr) => (ws.getCell(addr).fill = yellowFill),
        );

        // D38:D41, F38:H41, J38:L41 (termasuk baris diskon)
        ["D38", "D39", "D40", "D41"].forEach((addr) => (ws.getCell(addr).fill = yellowFill));
        for (let r = 38; r <= 41; r++) {
          for (let c = 6; c <= 8; c++) ws.getCell(r, c).fill = yellowFill; // F:H
          for (let c = 10; c <= 12; c++) ws.getCell(r, c).fill = yellowFill; // J:L
        }

        // F48, G48:H48, J48, K48:L48
        ["F48", "G48", "H48", "J48", "K48", "L48"].forEach(
          (addr) => (ws.getCell(addr).fill = yellowFill),
        );

        // D51:D75, F51:H75, J51:L75
        for (let r = 51; r <= 75; r++) {
          ws.getCell(r, 4).fill = yellowFill; // D
          for (let c = 6; c <= 8; c++) ws.getCell(r, c).fill = yellowFill; // F:H
          for (let c = 10; c <= 12; c++) ws.getCell(r, c).fill = yellowFill; // J:L
        }

        // D102:D104, F102:H104, J102:L104
        for (let r = 102; r <= 104; r++) {
          ws.getCell(r, 4).fill = yellowFill; // D
          for (let c = 6; c <= 8; c++) ws.getCell(r, c).fill = yellowFill; // F:H
          for (let c = 10; c <= 12; c++) ws.getCell(r, c).fill = yellowFill; // J:L
        }

        const h17b18 = mc("B17:B18", "NO", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h17b18.fill = blueHeaderFill;
        h17b18.font = blueHeaderFont;

        const h17c18 = mc("C17:C18", "JENIS TI-T", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h17c18.fill = blueHeaderFill;
        h17c18.font = blueHeaderFont;

        const h17d18 = mc("D17:D18", "TARIF (Rp.)", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h17d18.fill = blueHeaderFill;
        h17d18.font = blueHeaderFont;

        const h17prod = mc("E17:H17", "PRODUKSI", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h17prod.fill = blueHeaderFill;
        h17prod.font = blueHeaderFont;

        const h17pend = mc("I17:L17", "PENDAPATAN", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h17pend.fill = blueHeaderFill;
        h17pend.font = blueHeaderFont;

        const h18renc = sc("E18", "RENC.", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18renc.fill = blueHeaderFill;
        h18renc.font = blueHeaderFont;

        const h18real = sc("F18", "REAL", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18real.fill = blueHeaderFill;
        h18real.font = blueHeaderFont;

        const h18pct1 = mc("G18:H18", "(%)", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18pct1.fill = blueHeaderFill;
        h18pct1.font = blueHeaderFont;

        const h18rencana = sc("I18", "RENCANA", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18rencana.fill = blueHeaderFill;
        h18rencana.font = blueHeaderFont;

        const h18realisasi = sc("J18", "REALISASI", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18realisasi.fill = blueHeaderFill;
        h18realisasi.font = blueHeaderFont;

        const h18pct2 = mc("K18:L18", "(%)", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        h18pct2.fill = blueHeaderFill;
        h18pct2.font = blueHeaderFont;

        [
          ["B19", "1"],
          ["C19", "2"],
          ["D19", "3"],
          ["E19", "4"],
          ["F19", "5"],
          ["I19", "7"],
          ["J19", "8"],
        ].forEach(([a, v]) => {
          const c19 = sc(a, v, {
            border: "medium",
            align: { horizontal: "center" },
          });
          c19.fill = blueHeaderFill;
          c19.font = blueHeaderFont;
        });
        const g19 = mc("G19:H19", "6", {
          border: "medium",
          align: { horizontal: "center" },
        });
        g19.fill = blueHeaderFill;
        g19.font = blueHeaderFont;
        const k19 = mc("K19:L19", "9", {
          border: "medium",
          align: { horizontal: "center" },
        });
        k19.fill = blueHeaderFill;
        k19.font = blueHeaderFont;

        const brsStd = (
          row,
          no,
          label,
          tarif,
          eVal,
          fVal,
          iFormula,
          jFormula,
        ) => {
          if (no !== null)
            sc(`B${row}`, no, {
              align: { horizontal: "center", vertical: "middle" },
            });
          else b(ws.getCell(`B${row}`));
          sc(`C${row}`, label, {
            align: { vertical: "middle" },
          });

          // D tarif
          const dc = ws.getCell(`D${row}`);
          if (tarif || tarif === 0) {
            dc.value = Math.round(tarif);
            dc.numFmt = "#,##0";
            dc.alignment = { horizontal: "right", vertical: "middle" };
          }
          b(dc);

          // E rencana
          const ec = ws.getCell(`E${row}`);
          if (eVal !== "" && eVal !== null && eVal !== undefined)
            ec.value = eVal;
          ec.numFmt = "#,##0";
          ec.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          b(ec);

          // F realisasi
          const fc = ws.getCell(`F${row}`);
          if (fVal !== null && fVal !== undefined && fVal !== "") {
            fc.value = fVal;
            fc.numFmt = "#,##0";
          }
          b(fc);

          // G:H = %
          try {
            ws.mergeCells(`G${row}:H${row}`);
          } catch (e2) {}
          const gc = ws.getCell(`G${row}`);
          gc.value = {
            formula: `IF(OR(E${row}=0,F${row}=0),"",F${row}/E${row})`,
          };
          gc.numFmt = "0.00%";
          b(gc);

          // I rencana pendapatan
          const ic = ws.getCell(`I${row}`);
          if (iFormula) {
            ic.value = { formula: iFormula };
            ic.numFmt = "#,##0";
          }
          ic.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          b(ic);

          // J realisasi pendapatan
          const jc = ws.getCell(`J${row}`);
          if (jFormula) {
            jc.value = { formula: jFormula };
            jc.numFmt = "#,##0";
          }
          b(jc);

          // K:L = %
          try {
            ws.mergeCells(`K${row}:L${row}`);
          } catch (e2) {}
          const kc = ws.getCell(`K${row}`);
          if (iFormula && jFormula) {
            kc.value = { formula: `IF(I${row}=0,"",J${row}/I${row})` };
            kc.numFmt = "0.00%";
          }
          b(kc);
        };

        const brsHdr = (row, no, label, eRef) => {
          if (no)
            sc(`B${row}`, no, {
              border: "thin",
              align: { bold: true, horizontal: "center", vertical: "middle" },
            });
          else b(ws.getCell(`B${row}`));
          sc(`C${row}`, label, {
            bold: true,
            border: "thin",
            align: { vertical: "middle" },
          });
          b(ws.getCell(`D${row}`));
          const ec = ws.getCell(`E${row}`);
          if (eRef) {
            ec.value = eRef;
            ec.numFmt = "#,##0";
          }
          ec.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          b(ec);
          b(ws.getCell(`F${row}`));
          try {
            ws.mergeCells(`G${row}:H${row}`);
          } catch (e2) {}
          b(ws.getCell(`G${row}`));
          ws.getCell(`I${row}`).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          b(ws.getCell(`I${row}`));
          b(ws.getCell(`J${row}`));
          try {
            ws.mergeCells(`K${row}:L${row}`);
          } catch (e2) {}
          b(ws.getCell(`K${row}`));
        };

        const kinerjaBaseRow = 44 + kapalIndex * 4;
        const kinerjaRowAsalTujuan = kinerjaBaseRow;
        const kinerjaRowTujuanAsal = kinerjaBaseRow + 1;

        let f20val, f21val, f22val;
        if (arahRute === "asal_tujuan") {
          f20val = 0;
          f21val = { formula: `'Kinerja KAPAL'!AL${kinerjaRowAsalTujuan}` };
          f22val = { formula: `'Kinerja KAPAL'!AI${kinerjaRowAsalTujuan}` };
        } else if (arahRute === "tujuan_asal") {
          f20val = { formula: `'${namaSheetLbr}'!F20` };
          f21val = { formula: `'Kinerja KAPAL'!AL${kinerjaRowTujuanAsal}` };
          f22val = { formula: `'Kinerja KAPAL'!AI${kinerjaRowTujuanAsal}` };
        } else if (arahRute === "gabungan1") {
          f20val = { formula: `'${namaSheetLbr}'!F20` };
          f21val = { formula: `'Kinerja KAPAL'!AL${kinerjaRowAsalTujuan + 2}` };
          f22val = { formula: `'${namaSheetLbr}'!F22+'${namaSheetPdg}'!F22` };
        } else if (arahRute === "gabunganSemua") {
          f20val = 0;
          f21val = { formula: sumFFormula(21) };
          f22val = { formula: sumFFormula(22) };
        } else {
          f21val = hariOpsAktual;
          f22val = totalTripAktual;
        }

        brsHdr(20, "1", "HARI SIAP OPERASI", rencE(20));
        ws.getCell("F20").value = f20val;
        ws.getCell("F20").numFmt = "#,##0";
        ws.getCell("G20").value = {
          formula: 'IF(OR(E20=0,F20=0,E20="",F20=""),"",F20/E20)',
        };
        ws.getCell("G20").numFmt = "0.00%";

        brsHdr(21, "2", "HARI OPERASI", rencE(21));
        ws.getCell("F21").value = f21val;
        ws.getCell("F21").numFmt = "#,##0";
        ws.getCell("G21").value = {
          formula: 'IF(OR(E21=0,F21=0,E21="",F21=""),"",F21/E21)',
        };
        ws.getCell("G21").numFmt = "0.00%";

        brsHdr(22, "3", "TRIP", rencE(22));
        ws.getCell("F22").value = f22val;
        ws.getCell("F22").numFmt = "#,##0";
        ws.getCell("G22").value = {
          formula: 'IF(OR(E22=0,F22=0,E22="",F22=""),"",F22/E22)',
        };
        ws.getCell("G22").numFmt = "0.00%";

        brsHdr(23, "4", "PRODUKSI :", rencE(23));
        brsHdr(24, "a.", "PENUMPANG", rencE(24));

        brsStd(25, "", "1) Eksekutif", null, rencE(25), null, null, null);
        brsStd(26, "", "- Dewasa", null, rencE(26), null, null, null);
        brsStd(27, "", "- Anak", null, rencE(27), null, null, null);
        brsStd(28, "", "- Bayi", null, rencE(28), null, null, null);

        brsStd(29, "", "2) Bisnis I", null, rencE(29), null, null, null);
        brsStd(30, "", "- Dewasa", null, rencE(30), null, null, null);
        brsStd(31, "", "- Anak", null, rencE(31), null, null, null);
        brsStd(32, "", "- Bayi", null, rencE(32), null, null, null);

        brsStd(33, "", "3) Bisnis II", null, rencE(33), null, null, null);
        brsStd(34, "", "- Dewasa", null, rencE(34), null, null, null);
        brsStd(35, "", "- Anak", null, rencE(35), null, null, null);
        brsStd(36, "", "- Bayi", null, rencE(36), null, null, null);

        brsStd(37, "", "4) Ekonomi", null, rencE(37), null, null, null);
        
        // Data penumpang dengan pemisahan normal dan diskon
        const fVal38 = isGabunganSemua
          ? { formula: sumFFormula(38) }
          : isGabungan1
            ? { formula: `+'${namaSheetLbr}'!F38+'${namaSheetPdg}'!F38` }
            : pnpDetail.dewasa.normal;
            
        const fVal39 = isGabunganSemua
          ? { formula: sumFFormula(39) }
          : isGabungan1
            ? { formula: `+'${namaSheetLbr}'!F39+'${namaSheetPdg}'!F39` }
            : pnpDetail.dewasa.diskon;
            
        const fVal40 = isGabunganSemua
          ? { formula: sumFFormula(40) }
          : isGabungan1
            ? { formula: `+'${namaSheetLbr}'!F40+'${namaSheetPdg}'!F40` }
            : pnpDetail.anak.normal;
            
        const fVal41 = isGabunganSemua
          ? { formula: sumFFormula(41) }
          : isGabungan1
            ? { formula: `+'${namaSheetLbr}'!F41+'${namaSheetPdg}'!F41` }
            : pnpDetail.anak.diskon;

        // Tarif untuk baris normal dan diskon
        const tarifDewasaNormal = pnpDetail.dewasa.tarifNormal || tarifPenumpang.dewasa;
        const tarifDewasaDiskon = pnpDetail.dewasa.tarifDiskon || null;
        const tarifAnakNormal = pnpDetail.anak.tarifNormal || tarifPenumpang.anak;
        const tarifAnakDiskon = pnpDetail.anak.tarifDiskon || null;

        brsStd(
          38,
          "",
          "- Dewasa",
          tarifDewasaNormal,
          rencE(38),
          fVal38,
          isGabunganSemua ? sumIFormula(38) : `E38*D38`,
          isGabunganSemua
            ? sumJFormula(38)
            : isGabungan1
              ? `'${namaSheetLbr}'!J38+'${namaSheetPdg}'!J38`
              : `F38*D38`,
        );
        
        // Baris diskon Dewasa - isi jika ada data diskon
        brsStd(
          39,
          "",
          "- Dewasa (Diskon)",
          tarifDewasaDiskon,
          rencE(39),
          fVal39,
          isGabunganSemua ? sumIFormula(39) : tarifDewasaDiskon ? `E39*D39` : "",
          isGabunganSemua
            ? sumJFormula(39)
            : isGabungan1
              ? `'${namaSheetLbr}'!J39+'${namaSheetPdg}'!J39`
              : tarifDewasaDiskon ? `F39*D39` : "",
        );
        
        brsStd(
          40,
          "",
          "- Anak",
          tarifAnakNormal,
          rencE(40),
          fVal40,
          isGabunganSemua ? sumIFormula(40) : `E40*D40`,
          isGabunganSemua
            ? sumJFormula(40)
            : isGabungan1
              ? `'${namaSheetLbr}'!J40+'${namaSheetPdg}'!J40`
              : `F40*D40`,
        );
        
        // Baris diskon Anak - isi jika ada data diskon
        brsStd(
          41,
          "",
          "- Anak (Diskon)",
          tarifAnakDiskon,
          rencE(41),
          fVal41,
          isGabunganSemua ? sumIFormula(41) : tarifAnakDiskon ? `E41*D41` : "",
          isGabunganSemua
            ? sumJFormula(41)
            : isGabungan1
              ? `'${namaSheetLbr}'!J41+'${namaSheetPdg}'!J41`
              : tarifAnakDiskon ? `F41*D41` : "",
        );

        sc("C42", "- Bayi");
        b(ws.getCell("D42"));
        b(ws.getCell("E42"));
        b(ws.getCell("F42"));
        try {
          ws.mergeCells("G42:H42");
        } catch (e2) {}
        b(ws.getCell("G42"));
        b(ws.getCell("I42"));
        b(ws.getCell("J42"));
        try {
          ws.mergeCells("K42:L42");
        } catch (e2) {}
        b(ws.getCell("K42"));

        brsStd(43, "", "5) Suplesi", null, rencE(43), null, null, null);
        brsStd(44, "", "- Eksekutif", null, rencE(44), null, null, null);
        brsStd(45, "", "- Bisnis I", null, rencE(45), null, null, null);
        brsStd(46, "", "- Bisnis II Dewasa", null, rencE(46), null, null, null);
        brsStd(47, "", "- Bisnis II Anak", null, rencE(47), null, null, null);

        // Jumlah penumpang
        sc("C48", "Jumlah (4.a.1 s/d 4.a.5)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D48"));
        const e48val = rencE(48);

        if (isGabungan1) {
          ws.getCell("E48").value = { formula: "SUM(E38:E47)" };
        } else if (isGabunganSemua) {
          ws.getCell("E48").value = { formula: sumEFormula(48) };
        } else if (e48val) ws.getCell("E48").value = e48val;

        ws.getCell("E48").numFmt = "#,##0";
        b(ws.getCell("E48"));
        ws.getCell("F48").value = isGabunganSemua
          ? { formula: sumFFormula(48) }
          : { formula: "SUM(F38:F47)" };
        ws.getCell("F48").numFmt = "#,##0";
        b(ws.getCell("F48"));
        try {
          ws.mergeCells("G48:H48");
        } catch (e2) {}
        ws.getCell("G48").value = { formula: 'IF(E48=0,"",F48/E48)' };
        ws.getCell("G48").numFmt = "0.00%";
        b(ws.getCell("G48"));
        ws.getCell("I48").value = isGabunganSemua
          ? { formula: sumIFormula(48) }
          : { formula: "SUM(I38:I47)" };
        ws.getCell("I48").numFmt = "#,##0";
        b(ws.getCell("I48"));
        ws.getCell("J48").value = isGabunganSemua
          ? { formula: sumJFormula(48) }
          : { formula: "SUM(J38:J47)" };
        ws.getCell("J48").numFmt = "#,##0";
        b(ws.getCell("J48"));
        try {
          ws.mergeCells("K48:L48");
        } catch (e2) {}
        ws.getCell("K48").value = { formula: 'IF(I48=0,"",J48/I48)' };
        ws.getCell("K48").numFmt = "0.00%";
        b(ws.getCell("K48"));

        ["B", "C", "D", "E", "F", "I", "J"].forEach((col) =>
          b(ws.getCell(`${col}49`)),
        );
        try {
          ws.mergeCells("G49:H49");
        } catch (e2) {}
        b(ws.getCell("G49"));
        try {
          ws.mergeCells("K49:L49");
        } catch (e2) {}
        b(ws.getCell("K49"));

        // kendaraan per golongan
        brsHdr(50, "b.", "KENDARAAN", rencE(50));

        const golLabel = [
          "- Golongan I",
          "- Golongan II",
          "- Golongan III",
          "- Golongan IV",
          "- Golongan IV Pick Up",
          "- Golongan V Bus",
          "- Golongan V Truk",
          "- Golongan VI Bus",
          "- Golongan VI Truk",
          "- Golongan VII",
          "- Golongan VIII",
          "- Golongan IX",
        ];

        let currentRow = 51;
        GOL_ROW_MAP.forEach((g, i) => {
          const tarif = tarifPerRow[g.row] || 0;
          const key = getKndKey(g);
          const detail = kndDetail[key] || { normal: 0, diskon: 0, tarifNormal: 0, tarifDiskon: 0 };
          
          // Baris normal
          const fValNormal = isGabunganSemua
            ? { formula: sumFFormula(currentRow) }
            : isGabungan1
              ? realFGab1(currentRow)
              : detail.normal;
          const tarifNormal = detail.tarifNormal || tarif;
          const iFNormal = isGabunganSemua ? sumIFormula(currentRow) : `E${currentRow}*D${currentRow}`;
          const jFNormal = isGabunganSemua ? sumJFormula(currentRow) : realJFormula(currentRow);
          
          brsStd(currentRow, "", golLabel[i], tarifNormal, rencE(currentRow), fValNormal, iFNormal, jFNormal);
          currentRow++;
          
          // Baris diskon - isi jika ada data diskon
          const fValDiskon = isGabunganSemua
            ? { formula: sumFFormula(currentRow) }
            : isGabungan1
              ? realFGab1(currentRow)
              : detail.diskon;
          const tarifDiskon = detail.tarifDiskon || null;
          const iFDiskon = isGabunganSemua ? sumIFormula(currentRow) : tarifDiskon ? `E${currentRow}*D${currentRow}` : "";
          const jFDiskon = isGabunganSemua ? sumJFormula(currentRow) : tarifDiskon ? realJFormula(currentRow) : "";
          
          brsStd(currentRow, "", golLabel[i] + " (Diskon)", tarifDiskon, rencE(currentRow), fValDiskon, iFDiskon, jFDiskon);
          currentRow++;
        });

        // Jumlah kendaraan - sekarang di baris 75 (51 + 12*2)
        sc("C75", "Jumlah (4.b)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D75"));
        const e75val = rencE(75);
        if (isGabungan1) {
          ws.getCell("E75").value = { formula: "SUM(E51:E74)" };
        } else if (isGabunganSemua) {
          ws.getCell("E75").value = { formula: sumEFormula(75) };
        } else {
          if (e75val) ws.getCell("E75").value = e75val;
        }
        ws.getCell("E75").numFmt = "#,##0";
        b(ws.getCell("E75"));
        ws.getCell("F75").value = isGabunganSemua
          ? { formula: sumFFormula(75) }
          : { formula: "SUM(F51:F74)" };
        ws.getCell("F75").numFmt = "#,##0";
        b(ws.getCell("F75"));
        try {
          ws.mergeCells("G75:H75");
        } catch (e2) {}
        ws.getCell("G75").value = { formula: 'IF(E75=0,"",F75/E75)' };
        ws.getCell("G75").numFmt = "0.00%";
        b(ws.getCell("G75"));
        ws.getCell("I75").value = isGabunganSemua
          ? { formula: sumIFormula(75) }
          : { formula: "SUM(I51:I74)" };
        ws.getCell("I75").numFmt = "#,##0";
        b(ws.getCell("I75"));
        ws.getCell("J75").value = isGabunganSemua
          ? { formula: sumJFormula(75) }
          : { formula: "SUM(J51:J74)" };
        ws.getCell("J75").numFmt = "#,##0";
        b(ws.getCell("J75"));
        try {
          ws.mergeCells("K75:L75");
        } catch (e2) {}
        ws.getCell("K75").value = { formula: 'IF(I75=0,"",J75/I75)' };
        ws.getCell("K75").numFmt = "0.00%";
        b(ws.getCell("K75"));

        // load faktor - sekarang di baris 76
        brsHdr(76, "c.", "LOAD FACTOR", null);
        brsStd(77, "", "- Penumpang (%)", null, rencE(77), null, null, null);
        brsStd(78, "", "- Kendaraan (%)", null, rencE(78), null, null, null);
        sc("C79", "Jumlah (4.c)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D79"));
        const e79val = rencE(79);
        if (e79val) ws.getCell("E79").value = e79val;
        b(ws.getCell("E79"));
        b(ws.getCell("F79"));
        try {
          ws.mergeCells("G79:H79");
        } catch (e2) {}
        b(ws.getCell("G79"));
        b(ws.getCell("I79"));
        b(ws.getCell("J79"));
        try {
          ws.mergeCells("K79:L79");
        } catch (e2) {}
        b(ws.getCell("K79"));

        // barang - sekarang di baris 80
        brsHdr(80, "d.", "BARANG", null);
        brsStd(81, "", "1) Ton/M Kubik", null, rencE(81), null, null, null);
        brsStd(
          82,
          "",
          "2) Brg curah/M Kubik",
          null,
          rencE(82),
          null,
          null,
          null,
        );
        brsStd(
          83,
          "",
          "3) Brg tentengan/kg",
          null,
          rencE(83),
          null,
          null,
          null,
        );
        sc("C84", "Jumlah (4.d)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D84"));
        const e84val = rencE(84);
        if (e84val) ws.getCell("E84").value = e84val;
        b(ws.getCell("E84"));
        b(ws.getCell("F84"));
        try {
          ws.mergeCells("G84:H84");
        } catch (e2) {}
        b(ws.getCell("G84"));
        b(ws.getCell("I84"));
        b(ws.getCell("J84"));
        try {
          ws.mergeCells("K84:L84");
        } catch (e2) {}
        b(ws.getCell("K84"));

        // pendapatan lain - sekarang di baris 85
        brsHdr(85, "e.", "PENDAPATAN LAIN-2", null);
        [
          [86, "1) Hewan"],
          [87, "a). Kambing & sejenisnya"],
          [88, "b). Sapi & sejenisnya"],
          [89, "2) Charter"],
          [90, "3) Gayor"],
          [91, "4) Angkutan Pos"],
          [92, "5) Angkutan Khusus"],
          [93, "6) -nd. Sbg muatan"],
          [94, "- Golongan IIa"],
          [95, "- Golongan III"],
          [96, "- Golongan IV"],
          [97, "- Golongan V"],
          [98, "- Golongan VIa"],
          [99, "- Golongan VIb"],
          [100, "7) Lain-lain"],
        ].forEach(([row, lbl]) => {
          ["B", "C", "D", "F", "I", "J"].forEach((col) =>
            b(ws.getCell(`${col}${row}`)),
          );
          ws.getCell(`C${row}`).value = lbl;
          const ec = ws.getCell(`E${row}`);
          const eRef = rencE(row);
          if (eRef) {
            ec.value = eRef;
            ec.numFmt = "#,##0";
          }
          b(ec);
          try {
            ws.mergeCells(`G${row}:H${row}`);
          } catch (e2) {}
          b(ws.getCell(`G${row}`));
          try {
            ws.mergeCells(`K${row}:L${row}`);
          } catch (e2) {}
          b(ws.getCell(`K${row}`));
        });

        const ranges = [
          [20, 23],
          [25, 48],
          [51, 75],
          [77, 79],
          [81, 84],
          [86, 100],
        ];

        ranges.forEach(([start, end]) => {
          for (let r = start; r <= end; r++) {
            for (let c = 2; c <= 3; c++) {
              ws.getCell(r, c).border = {};
            }
            ws.getCell(r, 2).border = { right: { style: "thin" } };
          }
        });

        b(ws.getCell("B101"));
        sc("C101", "Jumlah (4.e)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D101"));
        const e101val = rencE(101);
        if (e101val) ws.getCell("E101").value = e101val;
        ws.getCell("E101").numFmt = "#,##0";
        b(ws.getCell("E101"));
        b(ws.getCell("F101"));
        try {
          ws.mergeCells("G101:H101");
        } catch (e2) {}
        b(ws.getCell("G101"));
        b(ws.getCell("I101"));
        b(ws.getCell("J101"));
        try {
          ws.mergeCells("K101:L101");
        } catch (e2) {}
        b(ws.getCell("K101"));

        // jumlah total
        mc("B102:C102", "JUMLAH TOTAL (4.a s/d 4.e)", {
          bold: true,
          border: "medium",
          align: { horizontal: "center", vertical: "middle" },
        });
        b(ws.getCell("D102"));
        b(ws.getCell("E102"));
        b(ws.getCell("F102"));
        try {
          ws.mergeCells("G102:H102");
        } catch (e2) {}
        b(ws.getCell("G102"));
        ws.getCell("I102").value = { formula: "I48+I75" };
        ws.getCell("I102").numFmt = "#,##0";
        b(ws.getCell("I102"));
        ws.getCell("J102").value = { formula: "J48+J75" };
        ws.getCell("J102").numFmt = "#,##0";
        b(ws.getCell("J102"));
        try {
          ws.mergeCells("K102:L102");
        } catch (e2) {}
        ws.getCell("K102").value = { formula: 'IF(I102=0,"",J102/I102)' };
        ws.getCell("K102").numFmt = "0.00%";
        b(ws.getCell("K102"));

        // reduksi
        sc("B103", "5", {
          border: "thin",
          align: { horizontal: "center", vertical: "middle" },
        });
        sc("C103", "Reduksi Pend.Penyebergn", {
          bold: true,
        });
        ws.getCell("D103").value = 0;
        ws.getCell("D103").numFmt = "#,##0";
        b(ws.getCell("D103"));
        ws.getCell("E103").value = { formula: "E48+E75" };
        ws.getCell("E103").numFmt = "#,##0";
        b(ws.getCell("E103"));
        ws.getCell("F103").value = { formula: "F48+F75" };
        ws.getCell("F103").numFmt = "#,##0";
        b(ws.getCell("F103"));
        try {
          ws.mergeCells("G103:H103");
        } catch (e2) {}
        ws.getCell("G103").value = { formula: 'IF(E103=0,"",F103/E103)' };
        ws.getCell("G103").numFmt = "0.00%";
        b(ws.getCell("G103"));
        ws.getCell("I103").value = isGabunganSemua
          ? { formula: sumIFormula(103) }
          : { formula: "E103*D103" };
        ws.getCell("I103").numFmt = "#,##0";
        b(ws.getCell("I103"));
        ws.getCell("J103").value = { formula: "F103*D103" };
        ws.getCell("J103").numFmt = "#,##0";
        b(ws.getCell("J103"));
        try {
          ws.mergeCells("K103:L103");
        } catch (e2) {}
        ws.getCell("K103").value = { formula: 'IF(I103=0,"",J103/I103)' };
        ws.getCell("K103").numFmt = "0.00%";
        b(ws.getCell("K103"));

        // total akhir
        b(ws.getCell("B104"));
        sc("C104", "Jumlah (3-4)", {
          bold: true,
          border: "thin",
          align: { horizontal: "right", vertical: "middle" },
        });
        b(ws.getCell("D104"));
        b(ws.getCell("E104"));
        b(ws.getCell("F104"));
        try {
          ws.mergeCells("G104:H104");
        } catch (e2) {}
        b(ws.getCell("G104"));
        ws.getCell("I104").value = { formula: "I102-I103" };
        ws.getCell("I104").numFmt = "#,##0";
        b(ws.getCell("I104"));
        ws.getCell("J104").value = { formula: "J102-J103" };
        ws.getCell("J104").numFmt = "#,##0";
        b(ws.getCell("J104"));
        try {
          ws.mergeCells("K104:L104");
        } catch (e2) {}
        ws.getCell("K104").value = { formula: 'IF(I104=0,"",J104/I104)' };
        ws.getCell("K104").numFmt = "0.00%";
        b(ws.getCell("K104"));

        // ═══════════════════════════════════════════════
        // HIDE BARIS DISKON YANG TIDAK ADA DATANYA
        // ═══════════════════════════════════════════════
        // Baris diskon penumpang
        const barisDiskonPenumpang = [39, 41]; // Dewasa (Diskon), Anak (Diskon)
        
        // Baris diskon kendaraan (baris genap dari 52-74)
        const barisDiskonKendaraan = [];
        for (let rowNum = 52; rowNum <= 74; rowNum += 2) {
          barisDiskonKendaraan.push(rowNum);
        }
        
        // Gabungkan semua baris diskon
        const semuaBarisDiskon = [...barisDiskonPenumpang, ...barisDiskonKendaraan];
        
        // Untuk sheet gabungan, cek data dari detail
        if (isGabungan1 || isGabunganSemua) {
          // Untuk gabungan, hide berdasarkan apakah ada data diskon di semua sheet sumber
          semuaBarisDiskon.forEach((rowNum) => {
            let adaData = false;
            
            // Cek baris penumpang
            if (rowNum === 39) {
              // Dewasa Diskon
              adaData = pnpDetail.dewasa.diskon > 0;
            } else if (rowNum === 41) {
              // Anak Diskon
              adaData = pnpDetail.anak.diskon > 0;
            } else {
              // Baris kendaraan - cek dari kndDetail
              // Hitung index golongan dari rowNum
              const golIndex = Math.floor((rowNum - 52) / 2);
              if (golIndex >= 0 && golIndex < GOL_ROW_MAP.length) {
                const g = GOL_ROW_MAP[golIndex];
                const key = getKndKey(g);
                const detail = kndDetail[key];
                adaData = detail && detail.diskon > 0;
              }
            }
            
            // Hide jika tidak ada data
            if (!adaData) {
              ws.getRow(rowNum).hidden = true;
            }
          });
        } else {
          // Untuk sheet per kapal, hide berdasarkan nilai cell
          semuaBarisDiskon.forEach((rowNum) => {
            const cellValue = ws.getCell(`F${rowNum}`).value;
            // Hide jika nilai 0 atau kosong
            if (!cellValue || cellValue === 0 || cellValue === "" || cellValue === null) {
              ws.getRow(rowNum).hidden = true;
            }
          });
        }

        // Border luar tabel
        bOuter(20, 2, 108, 12, "medium");

        for (let r = 20; r <= 104; r++) {
          ws.getCell(`E${r}`).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          ws.getCell(`I${r}`).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
        }

        // bold semua baris Jumlah
        [48, 75, 79, 84, 101, 102, 103, 104].forEach((r) => {
          ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].forEach((col) => {
            const cell = ws.getCell(`${col}${r}`);
            cell.font = { ...cell.font, name: "Calibri", size: 11, bold: true };
          });
        });

        // keterangan
        mc("B105:K105", "-KETERANGAN", { bold: true });
        sc("B106", "1. Docking");
        sc("D106", ":");
        sc("B107", "2. Rusak");
        sc("D107", ":");
        sc("B108", "3. Lain - lain", {
          vertical: "middle",
        });
        sc("D108", ":");
        try {
          ws.mergeCells("D108:K108");
        } catch (e2) {}

        ws.getCell("D108").alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
        ws.getRow(108).height = 30;

        // tanda tangan (dinamis berdasarkan pelabuhan asal)
        const tglSur = new Date(tanggalSampai);
        tglSur.setDate(tglSur.getDate() + 1);
        const ttdStr = `${pelabuhanAsal}, ${String(tglSur.getDate()).padStart(2, "0")} ${bulanNama[tglSur.getMonth()]} ${tglSur.getFullYear()}`;
        mc("I110:K110", ttdStr, {
          align: { horizontal: "center", vertical: "middle" },
        });
        mc("C111:E111", "Mengetahui :", { align: { horizontal: "center" } });
        mc("C112:E112", "GENERAL MANAGER", {
          bold: true,
          align: { horizontal: "center" },
        });
        mc("I112:K112", "MANAGER USAHA", {
          bold: true,
          align: { horizontal: "center" },
        });
        mc("C117:E117", suratDokumen.general_manager, {
          bold: true,
          align: { horizontal: "center" },
        });
        mc("I117:K117", suratDokumen.manager_usaha, {
          bold: true,
          align: { horizontal: "center" },
        });
        mc("C118:E118", "");
        mc("I118:K118", "");

        ws.pageSetup = {
          paperSize: 9,
          orientation: "portrait",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: "17:19",
        };
        ws.views = [{ showGridLines: true }];
        return ws;
      };

      // LOOP: buat 3 sheet per kapal ASDP + 1 gabungan semua
      // PENTING: Nama sheet harus konsisten dengan formula referensi
      const labelAsalShort = pelabuhanAsal.substring(0, 3).toUpperCase();
      const labelTujuanShort = pelabuhanTujuan.substring(0, 3).toUpperCase();
      
      kapalAsdpLembarPadangbai.forEach((kapal, kapalIndex) => {
        const np = getNamaPendekKpl(kapal.nama);
        
        // Nama sheet HARUS sama dengan yang digunakan di allGabSheets (formula)
        const sAsal = `${np}-${labelAsalShort}`.substring(0, 31);
        const sTujuan = `${np}-${labelTujuanShort}`.substring(0, 31);
        const sGab1 = `${np}-${labelAsalShort}-${labelTujuanShort}`.substring(0, 31);

        // Cari kapal di database dengan matching yang lebih baik
        const kDb = kapalAsdpTemplate.find((k) => {
          let n = k.nama_kapal.toUpperCase().trim();
          if (n.startsWith("KMP.")) n = n.substring(4).trim();

          // Normalisasi nama untuk perbandingan
          const nNorm = n
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          const npNorm = np
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");

          return nNorm === npNorm;
        });

        const gt = kDb?.gt || kapal.gt || "0";
        const kpPnp = "0"; // Bisa ditambahkan ke template jika perlu
        const kpKnd = "0"; // Bisa ditambahkan ke template jika perlu
        const dispNm = `KMP. ${kapal.nama}`;


        // Asal → Tujuan
        buatSheetLaporan(
          sAsal,
          dispNm,
          np,
          gt,
          kpPnp,
          kpKnd,
          "asal_tujuan",
          null,
          null,
          sGab1,
          kapalIndex,
          jarak,
        );
        // Tujuan → Asal
        buatSheetLaporan(
          sTujuan,
          dispNm,
          np,
          gt,
          kpPnp,
          kpKnd,
          "tujuan_asal",
          sAsal,
          null,
          sGab1,
          kapalIndex,
          jarak,
        );
        // Gabungan
        buatSheetLaporan(
          sGab1,
          dispNm,
          np,
          gt,
          kpPnp,
          kpKnd,
          "gabungan1",
          sAsal,
          sTujuan,
          null,
          kapalIndex,
          jarak,
        );
      });

      // Gabungan semua kapal - buat string nama kapal yang dihubungkan dengan "&"
      const namaSemuaKapal = kapalAsdpLembarPadangbai
        .map((k) => k.nama)
        .join(" & ");

      // Nama sheet gabungan dinamis, maksimal 31 karakter
      let namaSheetGabungan = `Gab. Kapal ${namaRute}`;
      if (namaSheetGabungan.length > 31) {
        namaSheetGabungan = namaSheetGabungan.substring(0, 31);
      }

      buatSheetLaporan(
        namaSheetGabungan,
        `KMP. ${namaSemuaKapal}`,
        "",
        "",
        "",
        "",
        "gabunganSemua",
        null,
        null,
        null,
        -1,
        "(gabungan)",
      );

      const filename = `Laporan Kinerja ${namaRute} ${bulan} ${tahun}.xlsx`;

      console.log("Writing Excel file to response...");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      await workbook.xlsx.write(res);
      res.end();
      console.log("=== EXPORT KINERJA ASDP COMPLETE ===");
    } catch (error) {
      console.error("Export Kinerja ASDP Error:", error);
      console.error("Error stack:", error.stack);
      next(error);
    }
  }
}

module.exports = LaporanKinerjaAsdpController;

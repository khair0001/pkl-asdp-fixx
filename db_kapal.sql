-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 30, 2026 at 02:47 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_kapal_testing`
--

-- --------------------------------------------------------

--
-- Table structure for table `golongan_kendaraan`
--

CREATE TABLE `golongan_kendaraan` (
  `golongan_id` int NOT NULL,
  `nomor_golongan` int NOT NULL,
  `tipe_muatan` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `golongan_kendaraan`
--

INSERT INTO `golongan_kendaraan` (`golongan_id`, `nomor_golongan`, `tipe_muatan`) VALUES
(1, 1, NULL),
(2, 2, NULL),
(3, 3, NULL),
(5, 4, 'barang'),
(4, 4, 'penumpang'),
(7, 5, 'barang'),
(6, 5, 'penumpang'),
(9, 6, 'barang'),
(8, 6, 'penumpang'),
(10, 7, NULL),
(11, 8, NULL),
(12, 9, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kapal`
--

CREATE TABLE `kapal` (
  `kapal_id` int NOT NULL,
  `perusahaan_id` int DEFAULT NULL,
  `nama_kapal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `berat_kapal` decimal(10,2) DEFAULT NULL,
  `kapasitas_penumpang` int DEFAULT '0' COMMENT 'Kapasitas penumpang dalam orang',
  `kapasitas_kendaraan` int DEFAULT '0' COMMENT 'Kapasitas kendaraan dalam unit',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kapal`
--

INSERT INTO `kapal` (`kapal_id`, `perusahaan_id`, `nama_kapal`, `berat_kapal`, `kapasitas_penumpang`, `kapasitas_kendaraan`, `is_active`, `created_at`, `updated_at`) VALUES
(28, 24, 'KMP. RODHITA', '908.00', 900, 456, 1, '2026-02-27 05:55:35', '2026-03-15 06:53:25'),
(29, 24, 'KMP. PORTLINK II', '649.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(30, 24, 'KMP. PRIMA NUSANTARA', '2773.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-06 01:22:01'),
(31, 25, 'KMP. JATRA II', '629.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(32, 27, 'KMP. DHARMA FERRY VIII', '625.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-27 14:45:25'),
(33, 27, 'KMP. DHARMA KENCANA IX', '1444.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-27 14:45:37'),
(34, 26, 'KMP. DHARMA FERRY IX', '2916.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(35, 27, 'KMP. MARINA SEGUNDA', '824.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-15 09:08:49'),
(36, 27, 'KMP. MARINA PRIMERA', '824.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-17 06:53:23'),
(37, 27, 'KMP. GADING NUSANTARA', '1325.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-27 14:45:47'),
(38, 27, 'KMP. SWARNA CAKRA', '829.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(39, 27, 'KMP. MARISA NUSANTARA', '3898.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(40, 28, 'KMP. SALINDO MUTIARA I', '1002.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(41, 28, 'KMP. GERBANG SARANA III', '1280.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(42, 29, 'KMP. NUSA BHAKTI', '673.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(43, 29, 'KMP. NUSA SHAKTI', '676.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(44, 29, 'KMP. NUSA PENIDA', '649.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(45, 30, 'KMP. PARAMA KALYANI', '1751.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(46, 30, 'KMP. ATHAYANA', '1875.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(47, 30, 'KMP. PUTRI YASMIN', '1790.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(48, 30, 'KMP. NARAYA', '1199.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(49, 31, 'KMP. SINDU DWITAMA', '818.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(50, 31, 'KMP. SINDU TRITAMA', '539.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(51, 32, 'KMP. SHITA GIRI NUSA', '971.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(52, 32, 'KMP. RHAMA GIRI NUSA', '641.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(53, 32, 'KMP. NUSA JAYA ABADI', '629.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(54, 32, 'KMP. ARJUNA GIRI NUSA', '234.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(55, 32, 'KMP. BIMA GIRI NUSA', '281.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(56, 33, 'KMP. PBK MURYATI', '851.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(57, 34, 'KMP. GEMILANG VIII', '870.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(58, 34, 'KMP. WIHAN', '869.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(59, 34, 'KMP. SURYA 777', '1197.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(60, 35, 'KMP. MUNIC III', '1824.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(61, 35, 'KMP. MUNIC I', '2641.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(62, 36, 'KMP. TUNU PRATAMA JAYA 5888', '1022.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(63, 37, 'KMP. JAMBO XII', '3871.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(64, 38, 'KMP. TRIMAS LAILA', '3006.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(65, 32, 'LCT. AYU 158', '460.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-03-30 02:33:23'),
(66, 32, 'LCT YUDISTIRA', '281.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35'),
(67, 32, 'LCT ABIMANYU', '460.00', 0, 0, 1, '2026-02-27 05:55:35', '2026-02-27 05:55:35');

-- --------------------------------------------------------

--
-- Table structure for table `kategori_penumpang`
--

CREATE TABLE `kategori_penumpang` (
  `kategori_penumpang_id` int NOT NULL,
  `nama_kategori` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori_penumpang`
--

INSERT INTO `kategori_penumpang` (`kategori_penumpang_id`, `nama_kategori`) VALUES
(2, 'Bayi'),
(1, 'Dewasa');

-- --------------------------------------------------------

--
-- Table structure for table `pelabuhan`
--

CREATE TABLE `pelabuhan` (
  `pelabuhan_id` int NOT NULL,
  `nama_pelabuhan` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pelabuhan`
--

INSERT INTO `pelabuhan` (`pelabuhan_id`, `nama_pelabuhan`, `lokasi`, `is_active`, `created_at`, `updated_at`) VALUES
(4, 'LEMBAR', 'LEMBAR', 1, '2026-02-27 05:56:04', '2026-02-27 05:56:50'),
(5, 'PADANGBAI', 'PADANGBAI', 1, '2026-02-27 05:56:18', '2026-02-27 05:57:09'),
(6, 'NUSA PENIDA', 'Nusa Penida', 1, '2026-02-27 05:56:38', '2026-02-27 05:56:57'),
(7, 'JANGKAR', 'JANGKAR', 1, '2026-02-27 05:57:15', '2026-02-27 05:57:15');

-- --------------------------------------------------------

--
-- Table structure for table `perusahaan`
--

CREATE TABLE `perusahaan` (
  `perusahaan_id` int NOT NULL,
  `nama_perusahaan` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `perusahaan`
--

INSERT INTO `perusahaan` (`perusahaan_id`, `nama_perusahaan`, `is_active`, `created_at`, `updated_at`) VALUES
(24, 'PT ASDP INDONESIA FERRY (PERSERO)', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(25, 'PT ASDP INDONESIA FERRY', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(26, 'PT DHARMA LAUTAN UTAMA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(27, 'PT JEMBATAN NUSANTARA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(28, 'PT GERBANG SARANA SAMUDRA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(29, 'PT SP FERRY (PUTERA MASTER)', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(30, 'PT JEMLA FERRY', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(31, 'PT SINDUTAMA BAHARI', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(32, 'PT SAMOEDRA JAYA GIRI NUSA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(33, 'PT PEWETE BAHTERA KENCANA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(34, 'PT TRIMITRA SAMUDRA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(35, 'PT MUNIC LINE', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(36, 'PT RAPUTRA JAYA', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(37, 'PT DUTABAHARI MENARA LINE', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04'),
(38, 'PT TRI SAKTI LAUTAN MAS', 1, '2026-02-27 05:50:04', '2026-02-27 05:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `produksi`
--

CREATE TABLE `produksi` (
  `produksi_id` int NOT NULL,
  `perusahaan_id` int DEFAULT NULL,
  `kapal_id` int DEFAULT NULL,
  `pelabuhan_asal_id` int DEFAULT NULL,
  `rute_id` int DEFAULT NULL,
  `nama_perusahaan` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kapal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_pelabuhan_asal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_pelabuhan_tujuan` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_rute` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_produksi` date NOT NULL,
  `shift` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `regu` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_penumpang` int DEFAULT '0',
  `total_pendapatan_penumpang` decimal(20,2) DEFAULT '0.00',
  `total_kendaraan` int DEFAULT '0',
  `total_pendapatan_kendaraan` decimal(20,2) DEFAULT '0.00',
  `total_pendapatan` decimal(20,2) DEFAULT '0.00',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `produksi_kendaraan`
--

CREATE TABLE `produksi_kendaraan` (
  `produksi_kendaraan_id` int NOT NULL,
  `produksi_id` int DEFAULT NULL,
  `golongan_id` int DEFAULT NULL,
  `nomor_golongan` int NOT NULL,
  `tipe_muatan` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah` int NOT NULL DEFAULT '0',
  `tarif` decimal(20,2) NOT NULL,
  `subtotal` decimal(20,2) NOT NULL,
  `is_tarif_custom` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `produksi_kendaraan`
--
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_kendaraan_delete` AFTER DELETE ON `produksi_kendaraan` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = OLD.produksi_id
        )
    WHERE produksi_id = OLD.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = OLD.produksi_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_kendaraan_insert` AFTER INSERT ON `produksi_kendaraan` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        )
    WHERE produksi_id = NEW.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = NEW.produksi_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_kendaraan_update` AFTER UPDATE ON `produksi_kendaraan` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        )
    WHERE produksi_id = NEW.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = NEW.produksi_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `produksi_penumpang`
--

CREATE TABLE `produksi_penumpang` (
  `produksi_penumpang_id` int NOT NULL,
  `produksi_id` int DEFAULT NULL,
  `kategori_penumpang_id` int DEFAULT NULL,
  `nama_kategori` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah` int NOT NULL DEFAULT '0',
  `tarif` decimal(20,2) NOT NULL,
  `subtotal` decimal(20,2) NOT NULL,
  `is_tarif_custom` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `produksi_penumpang`
--
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_penumpang_delete` AFTER DELETE ON `produksi_penumpang` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = OLD.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = OLD.produksi_id
        )
    WHERE produksi_id = OLD.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = OLD.produksi_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_penumpang_insert` AFTER INSERT ON `produksi_penumpang` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        )
    WHERE produksi_id = NEW.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = NEW.produksi_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_recalc_after_penumpang_update` AFTER UPDATE ON `produksi_penumpang` FOR EACH ROW BEGIN
    UPDATE produksi SET
        total_penumpang = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_penumpang = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_penumpang 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_kendaraan = (
            SELECT COALESCE(SUM(jumlah), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        ),
        total_pendapatan_kendaraan = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM produksi_kendaraan 
            WHERE produksi_id = NEW.produksi_id
        )
    WHERE produksi_id = NEW.produksi_id;
    
    UPDATE produksi SET
        total_pendapatan = total_pendapatan_penumpang + total_pendapatan_kendaraan
    WHERE produksi_id = NEW.produksi_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `rute`
--

CREATE TABLE `rute` (
  `rute_id` int NOT NULL,
  `pelabuhan_asal_id` int DEFAULT NULL,
  `pelabuhan_tujuan_id` int DEFAULT NULL,
  `nama_rute` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jarak` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rute`
--

INSERT INTO `rute` (`rute_id`, `pelabuhan_asal_id`, `pelabuhan_tujuan_id`, `nama_rute`, `jarak`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 4, 5, 'LEMBAR - PADANGBAI', '39.00', 1, '2026-02-27 05:57:39', '2026-03-15 07:03:20'),
(4, 4, 6, 'LEMBAR - NUSA PENIDA', '60.00', 1, '2026-02-27 05:57:54', '2026-03-15 07:03:13'),
(5, 4, 7, 'LEMBAR - JANGKAR', '50.00', 1, '2026-02-27 05:58:08', '2026-03-15 07:03:08'),
(6, 5, 4, 'PADANGBAI - LEMBAR', '39.00', 1, '2026-02-27 05:58:37', '2026-03-15 11:55:59');

-- --------------------------------------------------------

--
-- Table structure for table `surat_dokumen`
--

CREATE TABLE `surat_dokumen` (
  `surat_id` int NOT NULL,
  `no_dokumen` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor dokumen laporan',
  `revisi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor revisi dokumen',
  `halaman` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1 dari 1' COMMENT 'Halaman dokumen',
  `general_manager` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'HANDOYO PRIYANTO' COMMENT 'Nama General Manager',
  `manager_usaha` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ERWIN' COMMENT 'Nama Manager Usaha',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `surat_dokumen`
--

INSERT INTO `surat_dokumen` (`surat_id`, `no_dokumen`, `revisi`, `halaman`, `general_manager`, `manager_usaha`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'NC-102.00.10', '04', '1 dari 1', 'HANDOYO PRIYANTO', 'ERWIN', 1, '2026-03-15 07:40:53', '2026-03-15 07:56:14');

-- --------------------------------------------------------

--
-- Table structure for table `tarif_kendaraan`
--

CREATE TABLE `tarif_kendaraan` (
  `tarif_kendaraan_id` int NOT NULL,
  `rute_id` int DEFAULT NULL,
  `golongan_id` int DEFAULT NULL,
  `tarif` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tarif_kendaraan`
--

INSERT INTO `tarif_kendaraan` (`tarif_kendaraan_id`, `rute_id`, `golongan_id`, `tarif`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 69910, '2026-02-27 06:02:00', '2026-02-27 06:15:22'),
(2, 3, 2, 142700, '2026-02-27 06:07:24', '2026-02-27 06:15:31'),
(3, 3, 3, 304890, '2026-02-27 06:07:24', '2026-02-27 06:15:37'),
(4, 3, 4, 1105340, '2026-02-27 06:07:24', '2026-02-27 06:15:44'),
(5, 3, 5, 1057426, '2026-02-27 06:07:24', '2026-02-27 06:15:51'),
(6, 3, 6, 2068010, '2026-02-27 06:07:24', '2026-02-27 06:15:58'),
(7, 3, 7, 1769154, '2026-02-27 06:07:24', '2026-02-27 06:16:04'),
(8, 3, 8, 3377520, '2026-02-27 06:07:24', '2026-02-27 06:16:11'),
(9, 3, 9, 2990908, '2026-02-27 06:07:24', '2026-02-27 06:16:18'),
(10, 3, 10, 3790973, '2026-02-27 06:07:24', '2026-02-27 06:16:24'),
(11, 3, 11, 5346210, '2026-02-27 06:07:24', '2026-02-27 06:16:32'),
(12, 3, 12, 7757040, '2026-02-27 06:07:24', '2026-02-27 06:16:38'),
(13, 4, 1, 20110, '2026-02-27 06:07:24', '2026-02-27 06:24:55'),
(14, 4, 2, 35500, '2026-02-27 06:07:24', '2026-02-27 06:25:09'),
(15, 4, 3, 71890, '2026-02-27 06:07:24', '2026-02-27 06:25:43'),
(16, 4, 4, 276755, '2026-02-27 06:07:24', '2026-02-27 06:25:50'),
(17, 4, 5, 229941, '2026-02-27 06:07:24', '2026-02-27 06:25:56'),
(18, 4, 6, 478625, '2026-02-27 06:07:24', '2026-02-27 06:26:03'),
(19, 4, 7, 403969, '2026-02-27 06:07:24', '2026-02-27 06:26:10'),
(20, 4, 8, 809250, '2026-02-27 06:07:24', '2026-02-27 06:26:15'),
(21, 4, 9, 602938, '2026-02-27 06:07:24', '2026-02-27 06:26:26'),
(22, 4, 10, 1097703, '2026-02-27 06:07:24', '2026-02-27 06:26:34'),
(23, 4, 11, 1641940, '2026-02-27 06:07:24', '2026-02-27 06:26:40'),
(24, 4, 12, 9999999, '2026-02-27 06:07:24', '2026-03-17 01:58:24'),
(25, 5, 1, 126910, '2026-02-27 06:07:24', '2026-03-27 12:18:33'),
(26, 5, 2, 227100, '2026-02-27 06:07:24', '2026-02-27 06:28:30'),
(27, 5, 3, 456290, '2026-02-27 06:07:24', '2026-02-27 06:28:36'),
(28, 5, 4, 1370410, '2026-02-27 06:07:24', '2026-02-27 06:28:42'),
(29, 5, 5, 1358290, '2026-02-27 06:07:24', '2026-02-27 06:28:49'),
(30, 5, 6, 2443065, '2026-02-27 06:07:24', '2026-02-27 06:28:54'),
(31, 5, 7, 2493885, '2026-02-27 06:07:24', '2026-02-27 06:29:04'),
(32, 5, 8, 3916790, '2026-02-27 06:07:24', '2026-02-27 06:29:15'),
(33, 5, 9, 4034330, '2026-02-27 06:07:24', '2026-02-27 06:29:22'),
(34, 5, 10, 5310030, '2026-02-27 06:07:24', '2026-02-27 06:29:27'),
(35, 5, 11, 7471590, '2026-02-27 06:07:24', '2026-02-27 06:29:34'),
(36, 5, 12, 9108990, '2026-02-27 06:07:24', '2026-02-27 06:29:41'),
(37, 6, 1, 69910, '2026-02-27 06:07:24', '2026-02-27 06:30:10'),
(38, 6, 2, 142700, '2026-02-27 06:07:24', '2026-02-27 06:30:18'),
(39, 6, 3, 304890, '2026-02-27 06:07:24', '2026-02-27 06:30:24'),
(40, 6, 4, 1105340, '2026-02-27 06:07:24', '2026-02-27 06:30:32'),
(41, 6, 5, 1057426, '2026-02-27 06:07:24', '2026-02-27 06:30:39'),
(42, 6, 6, 2068010, '2026-02-27 06:07:24', '2026-02-27 06:30:55'),
(43, 6, 7, 1769154, '2026-02-27 06:07:24', '2026-02-27 06:31:01'),
(44, 6, 8, 3377520, '2026-02-27 06:07:24', '2026-02-27 06:31:08'),
(45, 6, 9, 2990908, '2026-02-27 06:07:24', '2026-02-27 06:31:15'),
(46, 6, 10, 3790973, '2026-02-27 06:07:24', '2026-02-27 06:31:24'),
(47, 6, 11, 5346210, '2026-02-27 06:07:24', '2026-02-27 06:31:33'),
(48, 6, 12, 7757040, '2026-02-27 06:07:24', '2026-02-27 06:31:40');

-- --------------------------------------------------------

--
-- Table structure for table `tarif_penumpang`
--

CREATE TABLE `tarif_penumpang` (
  `tarif_penumpang_id` int NOT NULL,
  `rute_id` int DEFAULT NULL,
  `kategori_penumpang_id` int DEFAULT NULL,
  `tarif` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tarif_penumpang`
--

INSERT INTO `tarif_penumpang` (`tarif_penumpang_id`, `rute_id`, `kategori_penumpang_id`, `tarif`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 54800, '2026-02-27 05:59:17', '2026-02-27 05:59:17'),
(2, 3, 2, 5100, '2026-02-27 05:59:41', '2026-02-27 05:59:41'),
(3, 4, 1, 25700, '2026-02-27 06:00:01', '2026-02-27 06:00:01'),
(4, 4, 2, 17700, '2026-02-27 06:00:16', '2026-02-27 06:00:16'),
(5, 5, 1, 113000, '2026-02-27 06:00:45', '2026-02-27 06:00:45'),
(6, 5, 2, 10700, '2026-02-27 06:00:57', '2026-02-27 06:00:57'),
(7, 6, 1, 54800, '2026-02-27 06:01:14', '2026-02-27 06:01:14'),
(8, 6, 2, 5100, '2026-02-27 06:01:25', '2026-02-27 06:01:25');

-- --------------------------------------------------------

--
-- Table structure for table `template_kapal_rute`
--

CREATE TABLE `template_kapal_rute` (
  `template_id` int NOT NULL,
  `rute_id` int NOT NULL,
  `kapal_id` int NOT NULL,
  `urutan` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `template_kapal_rute`
--

INSERT INTO `template_kapal_rute` (`template_id`, `rute_id`, `kapal_id`, `urutan`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 3, 28, 1, 1, '2026-03-13 02:38:01', '2026-03-13 02:38:01'),
(2, 3, 29, 2, 1, '2026-03-13 02:38:18', '2026-03-13 02:38:18'),
(3, 3, 32, 3, 1, '2026-03-13 02:39:01', '2026-03-13 02:39:01'),
(4, 3, 33, 4, 1, '2026-03-13 02:39:13', '2026-03-13 02:39:13'),
(11, 3, 35, 5, 1, '2026-03-15 12:23:03', '2026-03-15 12:23:24'),
(12, 3, 36, 6, 1, '2026-03-15 12:23:45', '2026-03-15 12:23:45'),
(13, 3, 37, 7, 1, '2026-03-15 12:23:55', '2026-03-15 12:23:55'),
(14, 3, 30, 8, 1, '2026-03-15 12:24:22', '2026-03-15 12:24:22'),
(15, 3, 40, 9, 1, '2026-03-15 12:24:35', '2026-03-15 12:24:35'),
(16, 3, 41, 10, 1, '2026-03-15 12:25:17', '2026-03-15 12:25:17'),
(17, 3, 42, 11, 1, '2026-03-15 12:25:33', '2026-03-15 12:25:33'),
(18, 3, 43, 12, 1, '2026-03-15 12:25:47', '2026-03-15 12:25:47'),
(19, 3, 44, 13, 1, '2026-03-15 12:25:57', '2026-03-15 12:25:57'),
(20, 3, 45, 16, 1, '2026-03-15 12:26:13', '2026-03-15 12:26:44'),
(21, 3, 46, 14, 1, '2026-03-15 12:26:58', '2026-03-15 12:26:58'),
(22, 3, 47, 15, 1, '2026-03-15 12:27:14', '2026-03-15 12:27:14'),
(23, 3, 48, 17, 1, '2026-03-15 12:27:42', '2026-03-15 12:27:42'),
(24, 3, 49, 18, 1, '2026-03-15 12:27:55', '2026-03-15 12:27:55'),
(25, 3, 50, 19, 1, '2026-03-15 12:28:38', '2026-03-15 12:28:38'),
(26, 3, 51, 20, 1, '2026-03-15 12:28:48', '2026-03-15 12:28:48'),
(27, 3, 52, 21, 1, '2026-03-15 12:29:00', '2026-03-15 12:29:00'),
(28, 3, 56, 22, 1, '2026-03-15 12:29:19', '2026-03-15 12:29:19'),
(29, 3, 57, 23, 1, '2026-03-15 12:29:28', '2026-03-15 12:29:28'),
(30, 3, 58, 24, 1, '2026-03-15 12:29:35', '2026-03-15 12:29:35'),
(31, 3, 59, 25, 1, '2026-03-15 12:29:48', '2026-03-15 12:29:48'),
(32, 3, 60, 26, 1, '2026-03-15 12:29:57', '2026-03-15 12:29:57'),
(33, 3, 61, 27, 1, '2026-03-15 12:30:04', '2026-03-15 12:30:04'),
(34, 6, 28, 1, 1, '2026-03-15 12:34:00', '2026-03-15 12:34:00'),
(35, 6, 29, 2, 1, '2026-03-15 12:34:21', '2026-03-15 12:34:21'),
(36, 6, 32, 3, 1, '2026-03-15 12:34:31', '2026-03-15 12:34:31'),
(37, 6, 33, 4, 1, '2026-03-15 12:34:41', '2026-03-15 12:34:41'),
(38, 6, 35, 5, 1, '2026-03-15 12:35:00', '2026-03-15 12:35:00'),
(39, 6, 36, 6, 1, '2026-03-15 12:35:08', '2026-03-15 12:35:08'),
(40, 6, 37, 7, 1, '2026-03-15 12:35:19', '2026-03-15 12:35:19'),
(41, 6, 30, 8, 1, '2026-03-15 12:35:39', '2026-03-15 12:35:39'),
(42, 6, 40, 9, 1, '2026-03-15 12:35:47', '2026-03-15 12:35:47'),
(43, 6, 41, 10, 1, '2026-03-15 12:36:00', '2026-03-15 12:36:00'),
(44, 6, 42, 11, 1, '2026-03-15 12:36:14', '2026-03-15 12:36:14'),
(45, 6, 43, 12, 1, '2026-03-15 12:36:25', '2026-03-15 12:36:25'),
(46, 6, 44, 13, 1, '2026-03-15 12:36:34', '2026-03-15 12:36:34'),
(47, 6, 45, 16, 1, '2026-03-15 12:36:42', '2026-03-15 12:36:52'),
(48, 6, 46, 14, 1, '2026-03-15 12:37:03', '2026-03-15 12:37:03'),
(49, 6, 47, 15, 1, '2026-03-15 12:37:12', '2026-03-15 12:37:12'),
(50, 6, 48, 17, 1, '2026-03-15 12:37:24', '2026-03-15 12:37:24'),
(51, 6, 49, 18, 1, '2026-03-15 12:37:33', '2026-03-15 12:37:33'),
(52, 6, 50, 19, 1, '2026-03-15 12:37:54', '2026-03-15 12:37:54'),
(53, 6, 51, 20, 1, '2026-03-15 12:38:03', '2026-03-15 12:38:03'),
(54, 6, 52, 21, 1, '2026-03-15 12:38:12', '2026-03-15 12:38:12'),
(55, 6, 56, 22, 1, '2026-03-15 12:38:23', '2026-03-15 12:38:23'),
(56, 6, 57, 23, 1, '2026-03-15 12:38:33', '2026-03-15 12:38:33'),
(57, 6, 58, 24, 1, '2026-03-15 12:38:40', '2026-03-15 12:38:40'),
(58, 6, 59, 25, 1, '2026-03-15 12:38:47', '2026-03-15 12:38:47'),
(59, 6, 60, 26, 1, '2026-03-15 12:38:56', '2026-03-15 12:38:56'),
(60, 6, 61, 27, 1, '2026-03-15 12:39:03', '2026-03-15 12:39:03'),
(61, 4, 53, 1, 1, '2026-03-15 12:39:28', '2026-03-15 12:39:28'),
(62, 4, 54, 2, 1, '2026-03-15 12:39:35', '2026-03-15 12:39:35'),
(63, 4, 55, 3, 1, '2026-03-15 12:39:44', '2026-03-15 12:39:44'),
(64, 4, 65, 4, 1, '2026-03-15 12:39:51', '2026-03-15 12:39:51'),
(65, 4, 66, 5, 1, '2026-03-15 12:39:58', '2026-03-15 12:39:58'),
(66, 4, 67, 6, 1, '2026-03-15 12:40:07', '2026-03-15 12:40:07'),
(67, 5, 31, 1, 1, '2026-03-15 12:40:20', '2026-03-15 12:40:20'),
(68, 5, 34, 2, 1, '2026-03-15 12:40:28', '2026-03-15 12:40:28'),
(69, 5, 47, 3, 1, '2026-03-15 12:40:35', '2026-03-15 12:40:35'),
(70, 5, 38, 4, 1, '2026-03-15 12:40:45', '2026-03-15 12:40:45'),
(71, 5, 39, 5, 1, '2026-03-15 12:40:56', '2026-03-15 12:40:56'),
(72, 5, 62, 6, 1, '2026-03-15 12:41:05', '2026-03-15 12:41:05'),
(73, 5, 63, 7, 1, '2026-03-15 12:41:12', '2026-03-15 12:41:12'),
(74, 5, 64, 8, 1, '2026-03-15 12:41:20', '2026-03-15 12:41:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `nama_lengkap`, `role`, `is_active`, `created_at`) VALUES
(1, 'testing', '$2b$10$td/gVsZFA6JQBJqVl7tCYOZq0ifbfhKn5V5hWp5olLLJ8dbQCPIm.', 'testing', 'user', 1, '2026-02-27 02:53:44'),
(2, 'admin', '$2b$10$6btstmCz2Fiua3aeuTbC.uCPemkGF430B4fPv12Y4E9Ea5NGL9t.u', 'admin', 'admin', 1, '2026-02-27 05:43:50');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_laporan_produksi_harian`
-- (See below for the actual view)
--
CREATE TABLE `v_laporan_produksi_harian` (
`produksi_id` int
,`tanggal_produksi` date
,`nama_perusahaan` varchar(100)
,`nama_kapal` varchar(100)
,`nama_rute` varchar(200)
,`shift` varchar(20)
,`regu` varchar(20)
,`total_penumpang` int
,`total_pendapatan_penumpang` decimal(20,2)
,`total_kendaraan` int
,`total_pendapatan_kendaraan` decimal(20,2)
,`total_pendapatan` decimal(20,2)
,`created_by_name` varchar(100)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_laporan_produksi_lengkap`
-- (See below for the actual view)
--
CREATE TABLE `v_laporan_produksi_lengkap` (
`produksi_id` int
,`tanggal_produksi` date
,`nama_perusahaan` varchar(100)
,`nama_kapal` varchar(100)
,`nama_pelabuhan_asal` varchar(100)
,`nama_pelabuhan_tujuan` varchar(100)
,`nama_rute` varchar(200)
,`shift` varchar(20)
,`regu` varchar(20)
,`total_penumpang` int
,`total_pendapatan_penumpang` decimal(20,2)
,`total_kendaraan` int
,`total_pendapatan_kendaraan` decimal(20,2)
,`total_pendapatan` decimal(20,2)
,`created_by_id` int
,`dibuat_oleh` varchar(100)
,`username_pembuat` varchar(50)
,`tanggal_dibuat` timestamp
,`updated_by_id` int
,`diupdate_oleh` varchar(100)
,`username_pengupdate` varchar(50)
,`tanggal_update` timestamp
,`perusahaan_id` int
,`kapal_id` int
,`pelabuhan_asal_id` int
,`rute_id` int
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_template_kapal_rute`
-- (See below for the actual view)
--
CREATE TABLE `v_template_kapal_rute` (
`template_id` int
,`rute_id` int
,`nama_rute` varchar(200)
,`kapal_id` int
,`nama_kapal` varchar(100)
,`gt` decimal(10,2)
,`urutan` int
,`perusahaan_id` int
,`nama_perusahaan` varchar(100)
,`is_active` tinyint(1)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `v_laporan_produksi_harian`
--
DROP TABLE IF EXISTS `v_laporan_produksi_harian`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_laporan_produksi_harian`  AS SELECT `p`.`produksi_id` AS `produksi_id`, `p`.`tanggal_produksi` AS `tanggal_produksi`, `p`.`nama_perusahaan` AS `nama_perusahaan`, `p`.`nama_kapal` AS `nama_kapal`, `p`.`nama_rute` AS `nama_rute`, `p`.`shift` AS `shift`, `p`.`regu` AS `regu`, `p`.`total_penumpang` AS `total_penumpang`, `p`.`total_pendapatan_penumpang` AS `total_pendapatan_penumpang`, `p`.`total_kendaraan` AS `total_kendaraan`, `p`.`total_pendapatan_kendaraan` AS `total_pendapatan_kendaraan`, `p`.`total_pendapatan` AS `total_pendapatan`, `u`.`nama_lengkap` AS `created_by_name`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at` FROM (`produksi` `p` left join `users` `u` on((`p`.`created_by` = `u`.`user_id`))) ORDER BY `p`.`tanggal_produksi` DESC, `p`.`created_at` DESC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_laporan_produksi_lengkap`
--
DROP TABLE IF EXISTS `v_laporan_produksi_lengkap`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_laporan_produksi_lengkap`  AS SELECT `p`.`produksi_id` AS `produksi_id`, `p`.`tanggal_produksi` AS `tanggal_produksi`, `p`.`nama_perusahaan` AS `nama_perusahaan`, `p`.`nama_kapal` AS `nama_kapal`, `p`.`nama_pelabuhan_asal` AS `nama_pelabuhan_asal`, `p`.`nama_pelabuhan_tujuan` AS `nama_pelabuhan_tujuan`, `p`.`nama_rute` AS `nama_rute`, `p`.`shift` AS `shift`, `p`.`regu` AS `regu`, `p`.`total_penumpang` AS `total_penumpang`, coalesce(`p`.`total_pendapatan_penumpang`,0) AS `total_pendapatan_penumpang`, `p`.`total_kendaraan` AS `total_kendaraan`, coalesce(`p`.`total_pendapatan_kendaraan`,0) AS `total_pendapatan_kendaraan`, coalesce(`p`.`total_pendapatan`,0) AS `total_pendapatan`, `u_created`.`user_id` AS `created_by_id`, `u_created`.`nama_lengkap` AS `dibuat_oleh`, `u_created`.`username` AS `username_pembuat`, `p`.`created_at` AS `tanggal_dibuat`, `u_updated`.`user_id` AS `updated_by_id`, `u_updated`.`nama_lengkap` AS `diupdate_oleh`, `u_updated`.`username` AS `username_pengupdate`, `p`.`updated_at` AS `tanggal_update`, `p`.`perusahaan_id` AS `perusahaan_id`, `p`.`kapal_id` AS `kapal_id`, `p`.`pelabuhan_asal_id` AS `pelabuhan_asal_id`, `p`.`rute_id` AS `rute_id` FROM ((`produksi` `p` left join `users` `u_created` on((`p`.`created_by` = `u_created`.`user_id`))) left join `users` `u_updated` on((`p`.`updated_by` = `u_updated`.`user_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `v_template_kapal_rute`
--
DROP TABLE IF EXISTS `v_template_kapal_rute`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_template_kapal_rute`  AS SELECT `tkr`.`template_id` AS `template_id`, `tkr`.`rute_id` AS `rute_id`, `r`.`nama_rute` AS `nama_rute`, `tkr`.`kapal_id` AS `kapal_id`, `k`.`nama_kapal` AS `nama_kapal`, `k`.`berat_kapal` AS `gt`, `tkr`.`urutan` AS `urutan`, `p`.`perusahaan_id` AS `perusahaan_id`, `p`.`nama_perusahaan` AS `nama_perusahaan`, `tkr`.`is_active` AS `is_active`, `tkr`.`created_at` AS `created_at`, `tkr`.`updated_at` AS `updated_at` FROM (((`template_kapal_rute` `tkr` join `rute` `r` on((`tkr`.`rute_id` = `r`.`rute_id`))) join `kapal` `k` on((`tkr`.`kapal_id` = `k`.`kapal_id`))) left join `perusahaan` `p` on((`k`.`perusahaan_id` = `p`.`perusahaan_id`))) ORDER BY `tkr`.`rute_id` ASC, `tkr`.`urutan` ASC  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `golongan_kendaraan`
--
ALTER TABLE `golongan_kendaraan`
  ADD PRIMARY KEY (`golongan_id`),
  ADD UNIQUE KEY `unique_golongan_tipe` (`nomor_golongan`,`tipe_muatan`);

--
-- Indexes for table `kapal`
--
ALTER TABLE `kapal`
  ADD PRIMARY KEY (`kapal_id`),
  ADD UNIQUE KEY `nama_kapal` (`nama_kapal`),
  ADD KEY `idx_kapal_perusahaan` (`perusahaan_id`);

--
-- Indexes for table `kategori_penumpang`
--
ALTER TABLE `kategori_penumpang`
  ADD PRIMARY KEY (`kategori_penumpang_id`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `pelabuhan`
--
ALTER TABLE `pelabuhan`
  ADD PRIMARY KEY (`pelabuhan_id`),
  ADD UNIQUE KEY `nama_pelabuhan` (`nama_pelabuhan`);

--
-- Indexes for table `perusahaan`
--
ALTER TABLE `perusahaan`
  ADD PRIMARY KEY (`perusahaan_id`),
  ADD UNIQUE KEY `nama_perusahaan` (`nama_perusahaan`);

--
-- Indexes for table `produksi`
--
ALTER TABLE `produksi`
  ADD PRIMARY KEY (`produksi_id`),
  ADD UNIQUE KEY `unique_produksi` (`kapal_id`,`rute_id`,`tanggal_produksi`,`shift`,`regu`),
  ADD KEY `pelabuhan_asal_id` (`pelabuhan_asal_id`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_produksi_tanggal` (`tanggal_produksi`),
  ADD KEY `idx_produksi_perusahaan` (`perusahaan_id`),
  ADD KEY `idx_produksi_kapal` (`kapal_id`),
  ADD KEY `idx_produksi_rute` (`rute_id`),
  ADD KEY `idx_produksi_shift` (`shift`),
  ADD KEY `idx_produksi_regu` (`regu`),
  ADD KEY `idx_produksi_created_by` (`created_by`);

--
-- Indexes for table `produksi_kendaraan`
--
ALTER TABLE `produksi_kendaraan`
  ADD PRIMARY KEY (`produksi_kendaraan_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `golongan_id` (`golongan_id`);

--
-- Indexes for table `produksi_penumpang`
--
ALTER TABLE `produksi_penumpang`
  ADD PRIMARY KEY (`produksi_penumpang_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `kategori_penumpang_id` (`kategori_penumpang_id`);

--
-- Indexes for table `rute`
--
ALTER TABLE `rute`
  ADD PRIMARY KEY (`rute_id`),
  ADD KEY `idx_rute_asal` (`pelabuhan_asal_id`),
  ADD KEY `idx_rute_tujuan` (`pelabuhan_tujuan_id`);

--
-- Indexes for table `surat_dokumen`
--
ALTER TABLE `surat_dokumen`
  ADD PRIMARY KEY (`surat_id`);

--
-- Indexes for table `tarif_kendaraan`
--
ALTER TABLE `tarif_kendaraan`
  ADD PRIMARY KEY (`tarif_kendaraan_id`),
  ADD UNIQUE KEY `unique_tarif_kendaraan` (`rute_id`,`golongan_id`),
  ADD KEY `golongan_id` (`golongan_id`);

--
-- Indexes for table `tarif_penumpang`
--
ALTER TABLE `tarif_penumpang`
  ADD PRIMARY KEY (`tarif_penumpang_id`),
  ADD UNIQUE KEY `unique_tarif_penumpang` (`rute_id`,`kategori_penumpang_id`),
  ADD KEY `kategori_penumpang_id` (`kategori_penumpang_id`);

--
-- Indexes for table `template_kapal_rute`
--
ALTER TABLE `template_kapal_rute`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `unique_kapal_per_rute` (`rute_id`,`kapal_id`),
  ADD UNIQUE KEY `unique_urutan_per_rute` (`rute_id`,`urutan`),
  ADD KEY `idx_template_rute` (`rute_id`),
  ADD KEY `idx_template_kapal` (`kapal_id`),
  ADD KEY `idx_template_urutan` (`rute_id`,`urutan`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `golongan_kendaraan`
--
ALTER TABLE `golongan_kendaraan`
  MODIFY `golongan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `kapal`
--
ALTER TABLE `kapal`
  MODIFY `kapal_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `kategori_penumpang`
--
ALTER TABLE `kategori_penumpang`
  MODIFY `kategori_penumpang_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pelabuhan`
--
ALTER TABLE `pelabuhan`
  MODIFY `pelabuhan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `perusahaan`
--
ALTER TABLE `perusahaan`
  MODIFY `perusahaan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `produksi`
--
ALTER TABLE `produksi`
  MODIFY `produksi_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `produksi_kendaraan`
--
ALTER TABLE `produksi_kendaraan`
  MODIFY `produksi_kendaraan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=342;

--
-- AUTO_INCREMENT for table `produksi_penumpang`
--
ALTER TABLE `produksi_penumpang`
  MODIFY `produksi_penumpang_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `rute`
--
ALTER TABLE `rute`
  MODIFY `rute_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `surat_dokumen`
--
ALTER TABLE `surat_dokumen`
  MODIFY `surat_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tarif_kendaraan`
--
ALTER TABLE `tarif_kendaraan`
  MODIFY `tarif_kendaraan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `tarif_penumpang`
--
ALTER TABLE `tarif_penumpang`
  MODIFY `tarif_penumpang_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `template_kapal_rute`
--
ALTER TABLE `template_kapal_rute`
  MODIFY `template_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `kapal`
--
ALTER TABLE `kapal`
  ADD CONSTRAINT `kapal_ibfk_1` FOREIGN KEY (`perusahaan_id`) REFERENCES `perusahaan` (`perusahaan_id`);

--
-- Constraints for table `produksi`
--
ALTER TABLE `produksi`
  ADD CONSTRAINT `produksi_ibfk_1` FOREIGN KEY (`perusahaan_id`) REFERENCES `perusahaan` (`perusahaan_id`),
  ADD CONSTRAINT `produksi_ibfk_2` FOREIGN KEY (`kapal_id`) REFERENCES `kapal` (`kapal_id`),
  ADD CONSTRAINT `produksi_ibfk_3` FOREIGN KEY (`pelabuhan_asal_id`) REFERENCES `pelabuhan` (`pelabuhan_id`),
  ADD CONSTRAINT `produksi_ibfk_4` FOREIGN KEY (`rute_id`) REFERENCES `rute` (`rute_id`),
  ADD CONSTRAINT `produksi_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `produksi_ibfk_6` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `produksi_kendaraan`
--
ALTER TABLE `produksi_kendaraan`
  ADD CONSTRAINT `produksi_kendaraan_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `produksi_kendaraan_ibfk_2` FOREIGN KEY (`golongan_id`) REFERENCES `golongan_kendaraan` (`golongan_id`);

--
-- Constraints for table `produksi_penumpang`
--
ALTER TABLE `produksi_penumpang`
  ADD CONSTRAINT `produksi_penumpang_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `produksi_penumpang_ibfk_2` FOREIGN KEY (`kategori_penumpang_id`) REFERENCES `kategori_penumpang` (`kategori_penumpang_id`);

--
-- Constraints for table `rute`
--
ALTER TABLE `rute`
  ADD CONSTRAINT `rute_ibfk_1` FOREIGN KEY (`pelabuhan_asal_id`) REFERENCES `pelabuhan` (`pelabuhan_id`),
  ADD CONSTRAINT `rute_ibfk_2` FOREIGN KEY (`pelabuhan_tujuan_id`) REFERENCES `pelabuhan` (`pelabuhan_id`);

--
-- Constraints for table `tarif_kendaraan`
--
ALTER TABLE `tarif_kendaraan`
  ADD CONSTRAINT `tarif_kendaraan_ibfk_1` FOREIGN KEY (`rute_id`) REFERENCES `rute` (`rute_id`),
  ADD CONSTRAINT `tarif_kendaraan_ibfk_2` FOREIGN KEY (`golongan_id`) REFERENCES `golongan_kendaraan` (`golongan_id`);

--
-- Constraints for table `tarif_penumpang`
--
ALTER TABLE `tarif_penumpang`
  ADD CONSTRAINT `tarif_penumpang_ibfk_1` FOREIGN KEY (`rute_id`) REFERENCES `rute` (`rute_id`),
  ADD CONSTRAINT `tarif_penumpang_ibfk_2` FOREIGN KEY (`kategori_penumpang_id`) REFERENCES `kategori_penumpang` (`kategori_penumpang_id`);

--
-- Constraints for table `template_kapal_rute`
--
ALTER TABLE `template_kapal_rute`
  ADD CONSTRAINT `template_kapal_rute_ibfk_1` FOREIGN KEY (`rute_id`) REFERENCES `rute` (`rute_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `template_kapal_rute_ibfk_2` FOREIGN KEY (`kapal_id`) REFERENCES `kapal` (`kapal_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

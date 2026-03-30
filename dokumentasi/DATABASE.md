# Database Documentation

Dokumentasi struktur database Sistem Informasi ASDP.

## Database Information

- **Database Name**: `db_kapal` (menyesuaikan dengan yang ada di env)
- **DBMS**: MySQL 8.0+
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## Table Schemas

### 1. users

Tabel untuk menyimpan data pengguna sistem.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key
- `username`: Username unik untuk login
- `password`: Password ter-hash (bcrypt)
- `nama`: Nama lengkap user
- `role`: Role user (admin/user)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`username`)

---

### 2. perusahaan

Tabel untuk menyimpan data perusahaan penyeberangan.

```sql
CREATE TABLE perusahaan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key
- `nama`: Nama perusahaan
- `alamat`: Alamat lengkap perusahaan
- `telepon`: Nomor telepon
- `email`: Email perusahaan

**Indexes:**
- PRIMARY KEY (`id`)

---

### 3. kapal

Tabel untuk menyimpan data kapal.

```sql
CREATE TABLE kapal (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  perusahaan_id INT NOT NULL,
  kapasitas_penumpang INT,
  kapasitas_kendaraan INT,
  gt DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (perusahaan_id) REFERENCES perusahaan(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `nama`: Nama kapal (contoh: KMP Rodhita)
- `perusahaan_id`: Foreign key ke tabel perusahaan
- `kapasitas_penumpang`: Kapasitas maksimal penumpang
- `kapasitas_kendaraan`: Kapasitas maksimal kendaraan
- `gt`: Gross Tonnage (berat kapal)

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`perusahaan_id`)

**Relations:**
- `perusahaan_id` → `perusahaan.id` (CASCADE DELETE)

---

### 4. pelabuhan

Tabel untuk menyimpan data pelabuhan.

```sql
CREATE TABLE pelabuhan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kode VARCHAR(10) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  lokasi VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key
- `kode`: Kode pelabuhan (contoh: MRK, BKH)
- `nama`: Nama pelabuhan
- `lokasi`: Lokasi/provinsi pelabuhan

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`kode`)

---

### 5. rute

Tabel untuk menyimpan data rute penyeberangan.

```sql
CREATE TABLE rute (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pelabuhan_asal_id INT NOT NULL,
  pelabuhan_tujuan_id INT NOT NULL,
  jarak DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelabuhan_asal_id) REFERENCES pelabuhan(id) ON DELETE CASCADE,
  FOREIGN KEY (pelabuhan_tujuan_id) REFERENCES pelabuhan(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `pelabuhan_asal_id`: Foreign key ke pelabuhan asal
- `pelabuhan_tujuan_id`: Foreign key ke pelabuhan tujuan
- `jarak`: Jarak tempuh dalam kilometer

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`pelabuhan_asal_id`)
- FOREIGN KEY (`pelabuhan_tujuan_id`)

**Relations:**
- `pelabuhan_asal_id` → `pelabuhan.id` (CASCADE DELETE)
- `pelabuhan_tujuan_id` → `pelabuhan.id` (CASCADE DELETE)

---

### 6. kategori_penumpang

Tabel master untuk kategori penumpang.

```sql
CREATE TABLE kategori_penumpang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(50) NOT NULL,
  keterangan TEXT
);
```

**Default Data:**
- Dewasa
- Anak (3-12 tahun)
- Bayi (0-2 tahun)
- Lansia
- Pelajar/Mahasiswa

**Columns:**
- `id`: Primary key
- `nama`: Nama kategori
- `keterangan`: Deskripsi kategori

---

### 7. golongan_kendaraan

Tabel master untuk golongan kendaraan.

```sql
CREATE TABLE golongan_kendaraan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(50) NOT NULL,
  keterangan TEXT
);
```

**Default Data:**
- Golongan I: Sepeda motor
- Golongan II: Mobil sedan
- Golongan III: Mobil pick-up
- Golongan IV: Mobil box/minibus
- Golongan V: Bus kecil
- Golongan VI: Bus besar
- Golongan VII: Truk kecil
- Golongan VIII: Truk besar

**Columns:**
- `id`: Primary key
- `nama`: Nama golongan
- `keterangan`: Deskripsi golongan

---

### 8. tarif_penumpang

Tabel untuk menyimpan tarif penumpang per rute.

```sql
CREATE TABLE tarif_penumpang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rute_id INT NOT NULL,
  kategori_penumpang_id INT NOT NULL,
  tarif DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rute_id) REFERENCES rute(id) ON DELETE CASCADE,
  FOREIGN KEY (kategori_penumpang_id) REFERENCES kategori_penumpang(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `rute_id`: Foreign key ke rute
- `kategori_penumpang_id`: Foreign key ke kategori penumpang
- `tarif`: Harga tarif dalam Rupiah

**Relations:**
- `rute_id` → `rute.id` (CASCADE DELETE)
- `kategori_penumpang_id` → `kategori_penumpang.id` (CASCADE DELETE)

---

### 9. tarif_kendaraan

Tabel untuk menyimpan tarif kendaraan per rute.

```sql
CREATE TABLE tarif_kendaraan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rute_id INT NOT NULL,
  golongan_kendaraan_id INT NOT NULL,
  tarif DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rute_id) REFERENCES rute(id) ON DELETE CASCADE,
  FOREIGN KEY (golongan_kendaraan_id) REFERENCES golongan_kendaraan(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `rute_id`: Foreign key ke rute
- `golongan_kendaraan_id`: Foreign key ke golongan kendaraan
- `tarif`: Harga tarif dalam Rupiah

**Relations:**
- `rute_id` → `rute.id` (CASCADE DELETE)
- `golongan_kendaraan_id` → `golongan_kendaraan.id` (CASCADE DELETE)

---

### 10. template_kapal_rute

Tabel untuk konfigurasi kapal yang beroperasi di rute tertentu.

```sql
CREATE TABLE template_kapal_rute (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rute_id INT NOT NULL,
  kapal_id INT NOT NULL,
  urutan INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rute_id) REFERENCES rute(id) ON DELETE CASCADE,
  FOREIGN KEY (kapal_id) REFERENCES kapal(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rute_kapal (rute_id, kapal_id)
);
```

**Columns:**
- `id`: Primary key
- `rute_id`: Foreign key ke rute
- `kapal_id`: Foreign key ke kapal
- `urutan`: Urutan kapal di rute (untuk prioritas)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`rute_id`, `kapal_id`)

**Relations:**
- `rute_id` → `rute.id` (CASCADE DELETE)
- `kapal_id` → `kapal.id` (CASCADE DELETE)

---

### 11. surat_dokumen

Tabel untuk menyimpan dokumen operasional.

```sql
CREATE TABLE surat_dokumen (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT,
  status ENUM('aktif', 'non-aktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key
- `nomor_surat`: Nomor surat resmi
- `tanggal_surat`: Tanggal surat diterbitkan
- `perihal`: Perihal/subjek surat
- `status`: Status surat (aktif/non-aktif)

**Indexes:**
- PRIMARY KEY (`id`)

---

### 12. produksi

Tabel utama untuk menyimpan data produksi harian.

```sql
CREATE TABLE produksi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATE NOT NULL,
  kapal_id INT NOT NULL,
  rute_id INT NOT NULL,
  trip INT NOT NULL,
  surat_dokumen_id INT,
  total_pendapatan DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kapal_id) REFERENCES kapal(id) ON DELETE CASCADE,
  FOREIGN KEY (rute_id) REFERENCES rute(id) ON DELETE CASCADE,
  FOREIGN KEY (surat_dokumen_id) REFERENCES surat_dokumen(id) ON DELETE SET NULL
);
```

**Columns:**
- `id`: Primary key
- `tanggal`: Tanggal produksi
- `kapal_id`: Foreign key ke kapal
- `rute_id`: Foreign key ke rute
- `trip`: Jumlah trip/perjalanan
- `surat_dokumen_id`: Foreign key ke surat dokumen (nullable)
- `total_pendapatan`: Total pendapatan dari produksi ini

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`tanggal`)
- FOREIGN KEY (`kapal_id`)
- FOREIGN KEY (`rute_id`)
- FOREIGN KEY (`surat_dokumen_id`)

**Relations:**
- `kapal_id` → `kapal.id` (CASCADE DELETE)
- `rute_id` → `rute.id` (CASCADE DELETE)
- `surat_dokumen_id` → `surat_dokumen.id` (SET NULL)

---

### 13. produksi_penumpang

Tabel detail penumpang per produksi.

```sql
CREATE TABLE produksi_penumpang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produksi_id INT NOT NULL,
  kategori_penumpang_id INT NOT NULL,
  jumlah INT NOT NULL,
  tarif DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(15,2) GENERATED ALWAYS AS (jumlah * tarif) STORED,
  FOREIGN KEY (produksi_id) REFERENCES produksi(id) ON DELETE CASCADE,
  FOREIGN KEY (kategori_penumpang_id) REFERENCES kategori_penumpang(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `produksi_id`: Foreign key ke produksi
- `kategori_penumpang_id`: Foreign key ke kategori penumpang
- `jumlah`: Jumlah penumpang
- `tarif`: Tarif per penumpang
- `subtotal`: Calculated field (jumlah × tarif)

**Relations:**
- `produksi_id` → `produksi.id` (CASCADE DELETE)
- `kategori_penumpang_id` → `kategori_penumpang.id` (CASCADE DELETE)

---

### 14. produksi_kendaraan

Tabel detail kendaraan per produksi.

```sql
CREATE TABLE produksi_kendaraan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produksi_id INT NOT NULL,
  golongan_kendaraan_id INT NOT NULL,
  jumlah INT NOT NULL,
  tarif DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(15,2) GENERATED ALWAYS AS (jumlah * tarif) STORED,
  FOREIGN KEY (produksi_id) REFERENCES produksi(id) ON DELETE CASCADE,
  FOREIGN KEY (golongan_kendaraan_id) REFERENCES golongan_kendaraan(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key
- `produksi_id`: Foreign key ke produksi
- `golongan_kendaraan_id`: Foreign key ke golongan kendaraan
- `jumlah`: Jumlah kendaraan
- `tarif`: Tarif per kendaraan
- `subtotal`: Calculated field (jumlah × tarif)

**Relations:**
- `produksi_id` → `produksi.id` (CASCADE DELETE)
- `golongan_kendaraan_id` → `golongan_kendaraan.id` (CASCADE DELETE)

---

## Database Queries

### Common Queries

#### 1. Get Produksi dengan Detail Lengkap

```sql
SELECT 
  p.id,
  p.tanggal,
  p.trip,
  k.nama AS kapal_nama,
  per.nama AS perusahaan_nama,
  pa.nama AS pelabuhan_asal,
  pt.nama AS pelabuhan_tujuan,
  r.jarak,
  sd.nomor_surat,
  p.total_pendapatan
FROM produksi p
JOIN kapal k ON p.kapal_id = k.id
JOIN perusahaan per ON k.perusahaan_id = per.id
JOIN rute r ON p.rute_id = r.id
JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.id
JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.id
LEFT JOIN surat_dokumen sd ON p.surat_dokumen_id = sd.id
WHERE p.tanggal BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY p.tanggal DESC;
```

#### 2. Get Total Pendapatan per Bulan

```sql
SELECT 
  DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
  SUM(total_pendapatan) AS total_pendapatan,
  COUNT(*) AS jumlah_produksi
FROM produksi
WHERE YEAR(tanggal) = 2024
GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
ORDER BY bulan;
```

#### 3. Get Produksi Penumpang Detail

```sql
SELECT 
  pp.id,
  p.tanggal,
  k.nama AS kapal_nama,
  kp.nama AS kategori_penumpang,
  pp.jumlah,
  pp.tarif,
  pp.subtotal
FROM produksi_penumpang pp
JOIN produksi p ON pp.produksi_id = p.id
JOIN kapal k ON p.kapal_id = k.id
JOIN kategori_penumpang kp ON pp.kategori_penumpang_id = kp.id
WHERE p.tanggal = '2024-01-15';
```

#### 4. Get Produksi Kendaraan Detail

```sql
SELECT 
  pk.id,
  p.tanggal,
  k.nama AS kapal_nama,
  gk.nama AS golongan_kendaraan,
  pk.jumlah,
  pk.tarif,
  pk.subtotal
FROM produksi_kendaraan pk
JOIN produksi p ON pk.produksi_id = p.id
JOIN kapal k ON p.kapal_id = k.id
JOIN golongan_kendaraan gk ON pk.golongan_kendaraan_id = gk.id
WHERE p.tanggal = '2024-01-15';
```

#### 5. Get Kapal Aktif per Rute

```sql
SELECT 
  r.id AS rute_id,
  pa.nama AS pelabuhan_asal,
  pt.nama AS pelabuhan_tujuan,
  k.nama AS kapal_nama,
  tkr.urutan
FROM template_kapal_rute tkr
JOIN rute r ON tkr.rute_id = r.id
JOIN pelabuhan pa ON r.pelabuhan_asal_id = pa.id
JOIN pelabuhan pt ON r.pelabuhan_tujuan_id = pt.id
JOIN kapal k ON tkr.kapal_id = k.id
ORDER BY r.id, tkr.urutan;
```

#### 6. Get Statistik Kapal

```sql
SELECT 
  k.id,
  k.nama AS kapal_nama,
  per.nama AS perusahaan_nama,
  COUNT(p.id) AS total_trip,
  SUM(p.total_pendapatan) AS total_pendapatan,
  AVG(p.trip) AS rata_rata_trip_per_hari
FROM kapal k
JOIN perusahaan per ON k.perusahaan_id = per.id
LEFT JOIN produksi p ON k.id = p.kapal_id
WHERE p.tanggal BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY k.id, k.nama, per.nama
ORDER BY total_pendapatan DESC;
```

---

## Database Maintenance

### Backup Database

#### Full Backup

```bash
mysqldump -u root -p db_kapal > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Backup Specific Tables

```bash
mysqldump -u root -p db_kapal users perusahaan kapal > backup_master.sql
```

#### Backup with Compression

```bash
mysqldump -u root -p db_kapal | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
mysql -u root -p db_kapal < backup_file.sql
```

### Optimize Tables

```sql
OPTIMIZE TABLE produksi;
OPTIMIZE TABLE produksi_penumpang;
OPTIMIZE TABLE produksi_kendaraan;
```

### Check Table Status

```sql
SHOW TABLE STATUS FROM db_kapal;
```

### Analyze Tables

```sql
ANALYZE TABLE produksi;
ANALYZE TABLE produksi_penumpang;
ANALYZE TABLE produksi_kendaraan;
```

---

## Indexes & Performance

### Recommended Indexes

```sql
-- Index untuk query berdasarkan tanggal
CREATE INDEX idx_produksi_tanggal ON produksi(tanggal);

-- Index untuk query berdasarkan kapal
CREATE INDEX idx_produksi_kapal ON produksi(kapal_id);

-- Index untuk query berdasarkan rute
CREATE INDEX idx_produksi_rute ON produksi(rute_id);

-- Composite index untuk filter kombinasi
CREATE INDEX idx_produksi_tanggal_kapal ON produksi(tanggal, kapal_id);
CREATE INDEX idx_produksi_tanggal_rute ON produksi(tanggal, rute_id);
```

### Query Performance Tips

1. Gunakan index untuk kolom yang sering di-filter
2. Hindari `SELECT *`, pilih kolom yang diperlukan saja
3. Gunakan `LIMIT` untuk pagination
4. Gunakan `EXPLAIN` untuk analyze query performance
5. Pertimbangkan caching untuk data yang jarang berubah

---

## Data Migration

### Add New Column

```sql
ALTER TABLE kapal 
ADD COLUMN tahun_pembuatan YEAR AFTER gt;
```

### Modify Column

```sql
ALTER TABLE perusahaan 
MODIFY COLUMN telepon VARCHAR(30);
```

### Drop Column

```sql
ALTER TABLE kapal 
DROP COLUMN tahun_pembuatan;
```

### Add Foreign Key

```sql
ALTER TABLE produksi
ADD CONSTRAINT fk_produksi_user
FOREIGN KEY (created_by) REFERENCES users(id);
```

---

## Security Best Practices

### 1. User Privileges

Buat user khusus untuk aplikasi (jangan gunakan root):

```sql
CREATE USER 'asdp_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON db_kapal.* TO 'asdp_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backup Strategy

- Daily backup otomatis
- Simpan backup di lokasi terpisah
- Test restore secara berkala
- Enkripsi backup untuk keamanan

### 3. Monitoring

Monitor:
- Slow queries
- Table size growth
- Connection pool usage
- Deadlocks

```sql
-- Show slow queries
SHOW PROCESSLIST;

-- Show table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'db_kapal'
ORDER BY size_mb DESC;
```

---

## Troubleshooting

### Connection Issues

```sql
-- Check user privileges
SHOW GRANTS FOR 'root'@'localhost';

-- Check connection limit
SHOW VARIABLES LIKE 'max_connections';

-- Show current connections
SHOW PROCESSLIST;
```

### Performance Issues

```sql
-- Show slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Show table locks
SHOW OPEN TABLES WHERE In_use > 0;
```

### Data Integrity

```sql
-- Check foreign key constraints
SELECT * FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'db_kapal';

-- Check for orphaned records
SELECT p.* FROM produksi p
LEFT JOIN kapal k ON p.kapal_id = k.id
WHERE k.id IS NULL;
```

---

**Database Version**: 1.0.0  
**Last Updated**: 2024

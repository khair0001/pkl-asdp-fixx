# Panduan Pengguna Sistem ASDP

Panduan lengkap penggunaan aplikasi Sistem Informasi ASDP untuk pengguna.

## Daftar Isi

- [Pengenalan](#pengenalan)
- [Login](#login)
- [Dashboard](#dashboard)
- [Master Data](#master-data)
- [Input Produksi](#input-produksi)
- [Data Produksi](#data-produksi)
- [Manajemen User](#manajemen-user)
- [Tips & Trik](#tips--trik)

## Pengenalan

Sistem Informasi ASDP adalah aplikasi berbasis web untuk mengelola data operasional perusahaan penyeberangan, meliputi:

- Data master (perusahaan, kapal, pelabuhan, rute, tarif)
- Input dan monitoring produksi harian
- Laporan dan analitik
- Manajemen pengguna

### Role Pengguna

1. **Admin**: Akses penuh ke semua fitur termasuk manajemen user
2. **User**: Akses ke fitur operasional (input produksi, lihat data)

## Login

### Cara Login

1. Buka aplikasi di browser: `http://localhost:5173` (development) atau URL production
2. Masukkan username dan password
3. Klik tombol "Login"

### Lupa Password

Hubungi administrator untuk reset password.

## Dashboard

Dashboard menampilkan ringkasan operasional:

### Statistik Utama

- **Total Produksi**: Jumlah trip dalam periode tertentu
- **Total Pendapatan**: Total pendapatan dalam Rupiah
- **Kapal Aktif**: Jumlah kapal yang beroperasi
- **Rute Aktif**: Jumlah rute yang tersedia

### Grafik Pendapatan Bulanan

Menampilkan tren pendapatan per bulan dalam bentuk chart.

### Filter Data

Gunakan filter tanggal untuk melihat statistik periode tertentu.

## Master Data

### 1. Perusahaan

Mengelola data perusahaan penyeberangan.

#### Tambah Perusahaan

1. Klik menu "Master Data" → "Perusahaan"
2. Klik tombol "+ Tambah Perusahaan"
3. Isi form:
	- Nama Perusahaan (wajib)
	- statusnya aktif atau tidak (jika tidak aktif maka tidak akan di tampilkan produksi)
4. Klik "Simpan"

#### Edit Perusahaan

1. Klik icon pensil (✏️) pada baris perusahaan
2. Ubah data yang diperlukan
3. Klik "Simpan"

#### Hapus Perusahaan

1. Klik icon tempat sampah (🗑️) pada baris perusahaan
2. Konfirmasi penghapusan

**Catatan**: Perusahaan yang memiliki kapal tidak bisa dihapus.

### 2. Kapal

Mengelola data kapal.

#### Tambah Kapal

1. Klik menu "Master Data" → "Kapal"
2. Klik tombol "+ Tambah Kapal"
3. Isi form:
   - Nama Kapal (wajib)
   - Perusahaan (pilih dari dropdown)
   - Kapasitas Penumpang
   - Kapasitas Kendaraan
   - GT
1. Klik "Simpan"

#### Filter Kapal

Gunakan dropdown "Filter Perusahaan" untuk melihat kapal per perusahaan.

### 3. Pelabuhan

Mengelola data pelabuhan.

#### Tambah Pelabuhan

1. Klik menu "Master Data" → "Pelabuhan"
2. Klik tombol "+ Tambah Pelabuhan"
3. Isi form:
   - Nama Pelabuhan
   - Lokasi
4. Klik "Simpan"

### 4. Rute

Mengelola rute penyeberangan.

#### Tambah Rute

1. Klik menu "Master Data" → "Rute"
2. Klik tombol "+ Tambah Rute"
3. Isi form:
   - Pelabuhan Asal (pilih dari dropdown)
   - Pelabuhan Tujuan (pilih dari dropdown)
   - Jarak (dalam kilometer)
4. Klik "Simpan"

**Catatan**: Pelabuhan asal dan tujuan harus berbeda.

### 5. Tarif

Mengelola tarif penumpang dan kendaraan.

#### Tarif Penumpang

1. Klik menu "Master Data" → "Tarif"
2. Tab "Tarif Penumpang"
3. Pilih Rute dari dropdown
4. Klik "+ Tambah Tarif"
5. Isi form:
   - Kategori Penumpang (Dewasa, Anak, Bayi, dll)
   - Tarif (dalam Rupiah)
6. Klik "Simpan"

#### Tarif Kendaraan

1. Tab "Tarif Kendaraan"
2. Pilih Rute dari dropdown
3. Klik "+ Tambah Tarif"
4. Isi form:
   - Golongan Kendaraan (I-VIII)
   - Tarif (dalam Rupiah)
5. Klik "Simpan"

### 6. Template Kapal-Rute

Mengatur kapal yang beroperasi di rute tertentu.

#### Tambah Kapal ke Rute

1. Klik menu "Master Data" → "Template Kapal-Rute"
2. Pilih Rute dari dropdown
3. Klik "+ Tambah Kapal"
4. Pilih kapal dari dropdown
5. Atur urutan (menyesuaikan)
6. Klik "Simpan"

### 7. Surat Dokumen

Mengelola dokumen operasional.

#### Edit Surat Dokumen

1. Klik menu "Master Data" → "Surat Dokumen"
2. Isi form:
	- Nomor Dokument
	- Revisi
	- halaman
	- GM
	- MU
3. Klik "Simpan"

## Input Produksi

Fitur untuk input data produksi harian.

### Langkah-langkah Input Produksi

#### Step 1: Pilih Kapal & Rute

1. Klik menu "Produksi" atau navbar→ "Input Produksi"
2. Pilih Tanggal
3. Pilih Kapal dari dropdown
4. Pilih Rute dari dropdown
5. Shift
6. Regu
7. Tanggal berapa trip itu

#### Step 2: Input Data Penumpang

1. Untuk setiap kategori penumpang:
	- Masukkan jumlah penumpang
	- Tarif akan otomatis terisi (dari master tarif)
	- Subtotal akan otomatis terhitung
2. +penumpang untuk tarif yang berbeda (bisa dari diskon)

#### Step 3: Input Data Kendaraan

1. Untuk setiap golongan kendaraan:
	- Masukkan jumlah kendaraan
	- Tarif akan otomatis terisi
	- Subtotal akan otomatis terhitung
2. +kendaraan untuk tarif yang berbeda (bisa dari diskon)

## Data Produksi

Melihat dan mengelola data produksi yang sudah diinput.

### Filter Data

1. Klik menu "Produksi" atau navbar→ "Data Produksi"
2. Gunakan filter:
	- Tanggal Mulai
	- Tanggal Akhir
	- perusahaan (opsional)
	- Kapal (opsional)
	- Rute (opsional)
	- shift (opsiaonal)
	- regu (opsional)
	- pelabuhan asal (opsional)
3. Klik cari untuk menampilkan datanya ()

### Lihat Detail Produksi

1. Klik icon mata (👁️) pada baris produksi
2. Modal akan menampilkan:
   - Informasi umum (tanggal, kapal, rute, trip)
   - Detail penumpang per kategori
   - Detail kendaraan per golongan
   - Total pendapatan

### Edit Produksi

1. Klik icon pensil (✏️) pada baris produksi
2. Ubah data yang diperlukan
3. Klik "Simpan"

### Hapus Produksi

1. Klik icon tempat sampah (🗑️) pada baris produksi
2. Konfirmasi penghapusan

**Catatan**: Data yang dihapus tidak bisa dikembalikan.

### Export Data

#### Export ke Excel

1. Set filter tanggal untuk menhgatur data yang akan diexport (hanay akan berdasarkan tanggal saja)
2. Klik tombol "Export Excel"
3. File Excel akan otomatis terdownload

**Isi Export:**
- Data produksi lengkap
- Detail penumpang
- Detail kendaraan
- Total pendapatan

#### Export Laporan Kinerja ASDP

1. Set filter periode
2. pilih rute yang mau didownload
3. Klik tombol "Export Kinerja ASDP"
4. File Excel dengan format laporan akan terdownload 

## Manajemen User

**Fitur ini hanya untuk Admin.**

### Tambah User

1. Klik menu "Admin" → "User Management"
2. Klik "+ Tambah User"
3. Isi form:
   - Username (unik)
   - Password
   - Nama Lengkap
   - Role (Admin/User)
4. Klik "Simpan"

### Edit User

1. Klik icon pensil (✏️) pada baris user
2. Ubah data yang diperlukan
3. Password bisa dikosongkan jika tidak ingin diubah
4. Klik "Simpan"

### Hapus User

1. Klik icon tempat sampah (🗑️) pada baris user
2. Konfirmasi penghapusan
### Best Practices

#### Input Data
1. **Backup**: Export data secara berkala

#### Produksi

1. **Input Harian**: Input data produksi setiap hari
2. **Review**: Cek data produksi secara berkala
3. **Export**: Export laporan bulanan untuk arsip

---
**terima kasih**

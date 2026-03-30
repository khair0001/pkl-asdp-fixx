# Sistem Informasi Laporan ASDP

Sistem manajemen data produksi dan operasional untuk perusahaan penyeberangan ASDP Indonesia Ferry.

---

## 📝 Deskripsi Project

Sistem Informasi ASDP adalah aplikasi web full-stack yang dirancang untuk mengelola operasional perusahaan penyeberangan. Aplikasi ini membantu dalam:

- **Manajemen Data Master**: Mengelola data perusahaan, kapal, pelabuhan, rute, dan tarif
- **Input Produksi Harian**: Mencatat data produksi penumpang dan kendaraan per trip
- **Monitoring & Pelaporan**: Dashboard analitik, grafik pendapatan, dan export laporan Excel
- **Manajemen Tarif**: Pengaturan tarif penumpang (8 kategori) dan kendaraan (8 golongan)
- **Template Operasional**: Konfigurasi kapal yang beroperasi di setiap rute
- **Administrasi User**: Sistem autentikasi dan manajemen user dengan role-based access

Aplikasi ini memudahkan operator dalam mencatat produksi harian, menghasilkan laporan kinerja, dan memantau pendapatan secara real-time.

---

## 🛠 Tools yang Digunakan

### Backend
| Tool | Versi | Fungsi |
|------|-------|--------|
| Node.js | 20.19.0+ / 22.12.0+ | Runtime JavaScript |
| Express.js | 5.2.1 | Web framework |
| MySQL | 8.0+ | Database relational |
| JWT | 9.0.3 | Authentication token |
| bcrypt | 6.0.0 | Password hashing |
| ExcelJS | 4.4.0 | Export laporan Excel |
| dotenv | 17.3.1 | Environment variables |
| cors | 2.8.6 | Cross-Origin Resource Sharing |
| nodemon | 3.0.2 | Development auto-reload |

### Frontend
| Tool | Versi | Fungsi |
|------|-------|--------|
| Vue.js | 3.5.27 | Progressive JavaScript framework |
| Vite | 7.3.1 | Build tool & dev server |
| Vue Router | 5.0.2 | Routing management |
| Axios | 1.13.5 | HTTP client |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| Chart.js | 4.5.1 | Data visualization |
| PostCSS | 8.5.6 | CSS processing |

### Development Tools
- **Git**: Version control
- **Postman**: API testing (collection tersedia)
- **MySQL Workbench**: Database management
- **VS Code**: Code editor (recommended)

---

## 📁 Struktur Folder Project

```
ASDP-PROJECT/
│
├── backend/                          # Backend API (Express.js)
│   ├── config/
│   │   └── database.js              # Konfigurasi koneksi MySQL
│   │
│   ├── controller/                  # Business logic controllers
│   │   ├── AuthController.js        # Login, register, profile
│   │   ├── DashboardController.js   # Statistik & grafik
│   │   ├── KapalController.js       # CRUD kapal
│   │   ├── PelabuhanController.js   # CRUD pelabuhan
│   │   ├── PerusahaanController.js  # CRUD perusahaan
│   │   ├── produksiController.js    # CRUD produksi
│   │   ├── RuteController.js        # CRUD rute
│   │   ├── SuratDokumenController.js
│   │   ├── TarifKendaraanController.js
│   │   ├── TarifPenumpangController.js
│   │   ├── TemplateKapalRuteController.js
│   │   ├── UserController.js        # CRUD users (admin)
│   │   └── masterDataController.js  # Kategori & golongan
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── errorHandler.js          # Global error handling
│   │
│   ├── models/                      # Database models & queries
│   │   ├── Kapal.js
│   │   ├── MasterData.js
│   │   ├── Pelabuhan.js
│   │   ├── Perusahaan.js
│   │   ├── Produksi.js
│   │   ├── ProduksiKendaraan.js
│   │   ├── ProduksiPenumpang.js
│   │   ├── Rute.js
│   │   ├── SuratDokumen.js
│   │   ├── TarifKendaraan.js
│   │   ├── TarifPenumpang.js
│   │   ├── TemplateKapalRute.js
│   │   └── User.js
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # /api/auth/*
│   │   ├── dashboard.js             # /api/dashboard/*
│   │   ├── masterData.js            # /api/master/*
│   │   ├── produksi.js              # /api/produksi/*
│   │   └── users.js                 # /api/users/*
│   │
│   ├── services/                    # Business services
│   │   ├── laporanKinerjaAsdpController.js  # Export laporan kinerja
│   │   └── produksiExportController.js      # Export Excel produksi
│   │
│   ├── public/
│   │   └── images/
│   │       └── logo_asdp.png
│   │
│   ├── .env                         # Environment variables (jangan commit!)
│   ├── .env.example                 # Template environment variables
│   ├── app.js                       # Entry point aplikasi
│   ├── test-db.js                   # Test koneksi database
│   └── package.json                 # Dependencies backend
│
├── frontend/                         # Frontend SPA (Vue.js)
│   ├── public/                      # Static assets
│   │   ├── favicon.ico
│   │   ├── login_img.png
│   │   └── logo_asdp.png
│   │
│   ├── src/
│   │   ├── assets/                  # CSS & images
│   │   │   ├── base.css
│   │   │   ├── main.css
│   │   │   └── logo.svg
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── MonthlyRevenueChart.vue  # Chart pendapatan
│   │   │   ├── MultiSelect.vue          # Multi-select dropdown
│   │   │   ├── SearchableSelect.vue     # Searchable dropdown
│   │   │   └── Sidebar.vue              # Navigation sidebar
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.vue       # Layout utama dengan sidebar
│   │   │
│   │   ├── router/
│   │   │   └── index.js             # Vue Router configuration
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios instance & API calls
│   │   │
│   │   ├── views/                   # Page components
│   │   │   ├── admin/
│   │   │   │   └── UserManagementView.vue
│   │   │   ├── auth/
│   │   │   │   └── LoginView.vue
│   │   │   ├── masterdata/
│   │   │   │   ├── KapalView.vue
│   │   │   │   ├── MasterDataView.vue
│   │   │   │   ├── PelabuhanView.vue
│   │   │   │   ├── PerusahaanView.vue
│   │   │   │   ├── RuteView.vue
│   │   │   │   ├── SuratDokumenView.vue
│   │   │   │   ├── TarifView.vue
│   │   │   │   └── TemplateKapalRuteView.vue
│   │   │   ├── produksi/
│   │   │   │   ├── DataProduksiView.vue
│   │   │   │   └── InputProduksiView.vue
│   │   │   └── DashboardView.vue
│   │   │
│   │   ├── App.vue                  # Root component
│   │   ├── main.js                  # Entry point
│   │   └── style.css                # Global styles
│   │
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template environment
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies frontend
│   ├── tailwind.config.cjs          # Tailwind configuration
│   ├── vite.config.js               # Vite configuration
│   └── vercel.json                  # Vercel deployment config
│
├── ASDP-API.postman_collection.json # Postman API collection
├── db_kapal_backup (3).sql          # Database backup
└── README.MD                         # Dokumentasi ini
```

**Penjelasan Struktur:**

- **backend/controller**: Berisi logic untuk handle request dan response
- **backend/models**: Berisi query database dan data access layer
- **backend/routes**: Mendefinisikan endpoint API dan routing
- **backend/services**: Business logic kompleks seperti export dan laporan
- **frontend/components**: Komponen Vue yang reusable
- **frontend/views**: Halaman-halaman aplikasi
- **frontend/services**: API client untuk komunikasi dengan backend

---

## 📦 Cara Instalasi

### Prasyarat

Pastikan sudah terinstal:
- Node.js v20.19.0 atau v22.12.0+
- npm v8.0.0+
- MySQL v8.0+
- Git

### Langkah Instalasi

#### 1. Clone Repository

```bash
git clone https://github.com/khair0001/pkl-asdp-fixx
cd <project-folder>
```

#### 2. Setup Database

Buat database MySQL:

```sql
CREATE DATABASE db_kapal;
```

Import database schema:

```bash
mysql -u root -p db_kapal < "db_kapal.sql"
```

Atau gunakan MySQL Workbench/phpMyAdmin untuk import file SQL.

#### 3. Setup Backend

```bash
cd backend
npm install
```

Copy dan edit file environment:

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:

```env
PORT=5000

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_kapal

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES=5h
```

**Penting**: Ganti `DB_PASSWORD` dan `JWT_SECRET`!

#### 4. Setup Frontend

```bash
cd frontend
npm install
```

Copy dan edit file environment:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Cara Run Code

### Development Mode (Recommended)

Buka 2 terminal terpisah:

#### Terminal 1 - Jalankan Backend

```bash
cd backend
npm run dev
```

Output yang diharapkan:
```
[nodemon] starting `node app.js`
Server berjalan di port 5000
```

Backend API akan berjalan di: `http://localhost:5000`

#### Terminal 2 - Jalankan Frontend

```bash
cd frontend
npm run dev
```

### Production Mode

#### Backend

```bash
cd backend
npm start
```

#### Frontend

Build terlebih dahulu:

```bash
cd frontend
npm run build
```

Preview hasil build:

```bash
npm run preview
```

### Akses Aplikasi

1. Buka browser dan akses: `http://localhost:5173`
2. Login dengan kredensial default (sesuai data di database)
3. Mulai gunakan aplikasi

### Health Check

Cek apakah backend berjalan dengan baik:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "ASDP API is running"
}
```

---

## 📚 Dokumentasi Tambahan

- **API Documentation**: Lihat `ASDP-API.postman_collection.json` untuk testing API
- **Database Schema**: Lihat file `db_kapal.sql`

---

## 🔐 Default User

Setelah import database, gunakan user default untuk login pertama kali (sesuaikan dengan data di database Anda).

---

## 🐛 Troubleshooting

### Backend tidak bisa start
**Error: Database connection failed**
- Pastikan MySQL service berjalan
- Cek kredensial di file `.env`
- Pastikan database `db_kapal` sudah dibuat

### Frontend tidak bisa connect ke backend

- Pastikan backend sudah running di port 5000
- Cek `VITE_API_URL` di file `frontend/.env`
- Cek CORS configuration di `backend/app.js`

### JWT token invalid

- Clear localStorage di browser (F12 → Application → Local Storage → Clear)
- Login ulang

---
**Terima Kasih**

# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Semua endpoint (kecuali login) memerlukan JWT token di header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Pesan error",
  "error": "Detail error"
}
```

## Endpoints

### 1. Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123",
  "nama": "John Doe",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User berhasil didaftarkan",
  "data": {
    "id": 1,
    "username": "johndoe",
    "nama": "John Doe",
    "role": "admin"
  }
}
```

#### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "nama": "John Doe",
      "role": "admin"
    }
  }
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "nama": "John Doe",
    "role": "admin"
  }
}
```

---

### 2. Dashboard

#### Get Statistics

```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Format YYYY-MM-DD
- `end_date` (optional): Format YYYY-MM-DD

#### Get Monthly Revenue

```http
GET /api/dashboard/monthly-revenue
Authorization: Bearer <token>
```

**Query Parameters:**
- `year` (optional): Default tahun sekarang

---

### 3. Master Data - Perusahaan

#### Get All Perusahaan

```http
GET /api/master/perusahaan
Authorization: Bearer <token>
```

#### Get Perusahaan by ID

```http
GET /api/master/perusahaan/:id
Authorization: Bearer <token>
```

#### Create Perusahaan

```http
POST /api/master/perusahaan
Authorization: Bearer <token>
```

#### Update Perusahaan

```http
PUT /api/master/perusahaan/:id
Authorization: Bearer <token>
```

**Request Body:** Same as Create

#### Delete Perusahaan

```http
DELETE /api/master/perusahaan/:id
Authorization: Bearer <token>
```

---

### 4. Master Data - Kapal

#### Get All Kapal

```http
GET /api/master/kapal
Authorization: Bearer <token>
```

#### Get Kapal by Perusahaan

```http
GET /api/master/kapal/perusahaan/:perusahaan_id
Authorization: Bearer <token>
```

#### Create Kapal

```http
POST /api/master/kapal
Authorization: Bearer <token>
```

#### Update Kapal

```http
PUT /api/master/kapal/:id
Authorization: Bearer <token>
```

#### Delete Kapal

```http
DELETE /api/master/kapal/:id
Authorization: Bearer <token>
```

---

### 5. Master Data - Pelabuhan

#### Get All Pelabuhan

```http
GET /api/master/pelabuhan
Authorization: Bearer <token>
```

#### Create Pelabuhan

```http
POST /api/master/pelabuhan
Authorization: Bearer <token>
```

---

### 6. Master Data - Rute

#### Get All Rute

```http
GET /api/master/rute
Authorization: Bearer <token>
```

#### Get Rute by Pelabuhan Asal

```http
GET /api/master/rute/pelabuhan-asal/:pelabuhan_asal_id
Authorization: Bearer <token>
```

#### Create Rute

```http
POST /api/master/rute
Authorization: Bearer <token>
```

---

### 7. Master Data - Tarif

#### Get Kategori Penumpang

```http
GET /api/master/kategori-penumpang
Authorization: Bearer <token>
```

#### Get Golongan Kendaraan

```http
GET /api/master/golongan-kendaraan
Authorization: Bearer <token>
```

#### Get Tarif Penumpang

```http
GET /api/master/tarif-penumpang
Authorization: Bearer <token>
```

#### Get Tarif Penumpang by Rute

```http
GET /api/master/tarif-penumpang/rute/:rute_id
Authorization: Bearer <token>
```

#### Create Tarif Penumpang

```http
POST /api/master/tarif-penumpang
Authorization: Bearer <token>
```

#### Get Tarif Kendaraan by Rute

```http
GET /api/master/tarif-kendaraan/rute/:rute_id
Authorization: Bearer <token>
```

#### Create Tarif Kendaraan

```http
POST /api/master/tarif-kendaraan
Authorization: Bearer <token>
```

---

### 8. Master Data - Template Kapal Rute

#### Get All Template

```http
GET /api/master/template-kapal-rute
Authorization: Bearer <token>
```

#### Get Rutes with ASDP Kapal

```http
GET /api/master/template-kapal-rute/rutes-with-asdp
Authorization: Bearer <token>
```


#### Get ASDP Kapal by Rute

```http
GET /api/master/template-kapal-rute/asdp-kapal/:rute_id
Authorization: Bearer <token>
```

#### Bulk Create Template

```http
POST /api/master/template-kapal-rute/rute/:rute_id/bulk-create
Authorization: Bearer <token>
```

#### Bulk Update Urutan

```http
POST /api/master/template-kapal-rute/rute/:rute_id/bulk-update-urutan
Authorization: Bearer <token>
```

---

### 9. Master Data - Surat Dokumen

#### Get All Surat Dokumen

```http
GET /api/master/surat-dokumen
Authorization: Bearer <token>
```

#### Get Active Surat Dokumen

```http
GET /api/master/surat-dokumen/active
Authorization: Bearer <token>
```

#### Create Surat Dokumen

```http
POST /api/master/surat-dokumen
Authorization: Bearer <token>
```

---

### 10. Produksi

#### Get All Produksi

```http
GET /api/produksi
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Format YYYY-MM-DD
- `end_date` (optional): Format YYYY-MM-DD
- `kapal_id` (optional)
- `rute_id` (optional)

#### Get Produksi by ID

```http
GET /api/produksi/:id
Authorization: Bearer <token>
```

#### Create Produksi

```http
POST /api/produksi
Authorization: Bearer <token>
```

#### Update Produksi

```http
PUT /api/produksi/:id
Authorization: Bearer <token>
```

**Request Body:** Same as Create

#### Delete Produksi

```http
DELETE /api/produksi/:id
Authorization: Bearer <token>
```

#### Export to Excel

```http
GET /api/produksi/export/excel
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (required): Format YYYY-MM-DD
- `end_date` (required): Format YYYY-MM-DD
- `kapal_id` (optional)
- `rute_id` (optional)

**Response:** Excel file download

#### Export Laporan Kinerja ASDP

```http
GET /api/produksi/export/kinerja-asdp
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (required): Format YYYY-MM-DD
- `end_date` (required): Format YYYY-MM-DD
- `rute_id` (optional)

**Response:** Excel file download

---

### 11. Users (Admin Only)

#### Get All Users

```http
GET /api/users
Authorization: Bearer <token>
```

#### Create User

```http
POST /api/users
Authorization: Bearer <token>
```
#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
```

Note: Password is optional in update

#### Delete User

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting
bisa menambahkan ini agar tidak di bruteforce

```
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // max 100 request
});

app.use(limiter);
```

## Postman Collection

Import file `ASDP-API.postman_collection.json` ke Postman untuk testing API dengan mudah.

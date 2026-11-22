# API UTS Pemrograman API

REST API sederhana untuk dua resource yang berelasi, **kategori** (tabel induk) dan **produk** (tabel anak), dibangun dengan Node.js, Express, dan PostgreSQL.

## Teknologi

- Node.js dan Express
- PostgreSQL (driver `pg`)
- `dotenv` untuk konfigurasi
- `nodemon` untuk mode pengembangan

## Struktur Proyek

```
api-uts/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── sql/
│   ├── schema.sql        # struktur tabel
│   └── seed.sql          # data awal
└── src/
    ├── app.js            # konfigurasi Express dan penanganan error
    ├── server.js         # menjalankan server
    ├── config/db.js      # koneksi PostgreSQL
    ├── routes/           # kategoriRoutes.js, produkRoutes.js
    ├── middlewares/      # parseId.js, validateKategori.js, validateProduk.js
    ├── controllers/      # kategoriController.js, produkController.js
    └── repositories/     # kategoriRepository.js, produkRepository.js
```

Alur permintaan: **route → middleware (parseId, validasi) → controller → repository → database**. Semua error diteruskan ke penanganan error terpusat di `app.js`.

## Cara Menjalankan

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu isi dengan konfigurasi database PostgreSQL kamu.
3. Buat database kosong di PostgreSQL.
4. Jalankan struktur tabel lalu data awal:
   ```bash
   psql -U <user> -d <nama_database> -f sql/schema.sql
   psql -U <user> -d <nama_database> -f sql/seed.sql
   ```
   Alternatif lain: buka `sql/schema.sql` dan `sql/seed.sql` di pgAdmin atau HeidiSQL, lalu eksekusi isinya.
5. Jalankan server:
   ```bash
   npm run dev
   ```
   Server berjalan di `http://localhost:3000` (atau port dari variabel `PORT` di `.env`).

`seed.sql` mengosongkan kedua tabel (`TRUNCATE ... RESTART IDENTITY`) sebelum mengisi ulang, sehingga aman dijalankan berulang kali untuk mengembalikan data ke kondisi awal.

## Skema Database

**kategori**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | SERIAL | primary key |
| nama_kategori | VARCHAR(50) | wajib, UNIQUE |
| deskripsi | VARCHAR(200) | opsional |
| created_at | TIMESTAMP | default `NOW()` |

**produk**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | SERIAL | primary key |
| kategori_id | INTEGER | wajib, foreign key ke `kategori(id)` |
| kode_produk | VARCHAR(20) | wajib, UNIQUE |
| nama_produk | VARCHAR(100) | wajib |
| harga | INTEGER | wajib, `CHECK (harga > 0)` |
| stok | INTEGER | wajib, default 0, `CHECK (stok >= 0)` |
| created_at | TIMESTAMP | default `NOW()` |
| deleted_at | TIMESTAMP | `NULL` berarti produk aktif (penanda soft delete) |

### Relasi

Relasinya satu ke banyak: satu **kategori** memiliki banyak **produk**, dan setiap produk wajib milik tepat satu kategori lewat foreign key `produk.kategori_id → kategori.id`. Foreign key dibuat tanpa `ON DELETE CASCADE`, sehingga PostgreSQL menolak (kode `23503`) penghapusan kategori yang masih dirujuk produk, dan juga menolak produk dengan `kategori_id` yang tidak ada.

## Endpoint

### Kategori (tabel induk, hard delete)

| Method | URL | Fungsi | Status |
|---|---|---|---|
| GET | `/api/kategori` | Daftar semua kategori | 200 |
| GET | `/api/kategori/:id` | Detail satu kategori | 200, 400, 404 |
| POST | `/api/kategori` | Tambah kategori | 201, 400, 409 |
| DELETE | `/api/kategori/:id` | Hard delete (`DELETE FROM`) | 204, 400, 404, 409 |

### Produk (tabel anak, CRUD lengkap)

| Method | URL | Fungsi | Status |
|---|---|---|---|
| GET | `/api/produk` | Daftar produk aktif beserta `count` | 200 |
| GET | `/api/produk/:id` | Detail satu produk aktif | 200, 400, 404 |
| GET | `/api/kategori/:id/produk` | Produk aktif milik satu kategori (kosong tetap 200) | 200, 400, 404 |
| POST | `/api/produk` | Tambah produk | 201, 400, 409, 422 |
| PUT | `/api/produk/:id` | Ganti seluruh data, semua field wajib | 200, 400, 404, 409, 422 |
| PATCH | `/api/produk/:id` | Ubah sebagian field | 200, 400, 404, 409, 422 |
| DELETE | `/api/produk/:id` | Soft delete | 204, 400, 404 |
| PATCH | `/api/produk/:id/restore` | Pulihkan produk yang di-soft delete | 200, 400, 404 |

### Arti kode status

| Kode | Pemakaian |
|---|---|
| 200 / 201 / 204 | Berhasil / data dibuat / berhasil tanpa isi (hapus) |
| 400 | ID bukan bilangan bulat positif, validasi gagal, PUT dengan field kurang, PATCH dengan body kosong, atau JSON rusak |
| 404 | Data tidak ditemukan (termasuk produk yang sudah di-soft delete) atau route tidak dikenal |
| 409 | Pelanggaran UNIQUE (`23505`), misalnya `kode_produk` atau `nama_kategori` kembar, atau hapus kategori yang masih dirujuk produk (`23503` pada DELETE) |
| 422 | `kategori_id` tidak ada di tabel kategori (`23503` pada INSERT atau UPDATE produk) |
| 500 | Kesalahan tak terduga, dengan pesan umum |

Kode PostgreSQL `23503` sama untuk dua kasus di atas. Pembedanya adalah operasinya: `DELETE` pada induk dibalas 409, sedangkan INSERT atau UPDATE pada anak dibalas 422.

## Contoh Body dan Respons

Semua request yang membawa body memakai header `Content-Type: application/json`.

### POST /api/kategori

Body:
```json
{
  "nama_kategori": "Olahraga",
  "deskripsi": "Peralatan dan perlengkapan olahraga"
}
```
Respons `201`:
```json
{
  "status": "success",
  "message": "Kategori berhasil ditambahkan",
  "data": {
    "id": 4,
    "nama_kategori": "Olahraga",
    "deskripsi": "Peralatan dan perlengkapan olahraga",
    "created_at": "2026-11-22T03:40:12.678Z"
  }
}
```

### POST /api/produk

Body:
```json
{
  "kategori_id": 1,
  "kode_produk": "ELK-010",
  "nama_produk": "Webcam HD",
  "harga": 450000,
  "stok": 15
}
```
Respons `201`:
```json
{
  "status": "success",
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": 7,
    "kategori_id": 1,
    "kode_produk": "ELK-010",
    "nama_produk": "Webcam HD",
    "harga": 450000,
    "stok": 15,
    "created_at": "2026-11-22T03:40:12.678Z",
    "deleted_at": null
  }
}
```

### PUT /api/produk/:id (ganti seluruh data, semua field wajib)

Body:
```json
{
  "kategori_id": 1,
  "kode_produk": "ELK-010",
  "nama_produk": "Webcam HD Pro",
  "harga": 520000,
  "stok": 20
}
```
Respons `200` berisi `message: "Produk berhasil diperbarui"` dan `data` produk setelah diganti.

### PATCH /api/produk/:id (ubah sebagian field)

Body (cukup field yang berubah):
```json
{
  "stok": 40
}
```
Respons `200` berisi `message: "Produk berhasil diubah"` dan `data` produk setelah diubah. Field lain tidak berubah.

### DELETE /api/produk/:id dan PATCH /api/produk/:id/restore

Tidak memakai body. Soft delete yang berhasil membalas `204` tanpa isi. Restore yang berhasil membalas `200` dengan `message: "Produk berhasil dipulihkan"`.

### Contoh respons error

Validasi gagal (`400`), misalnya `harga` negatif dan `stok` bukan angka:
```json
{
  "status": "error",
  "message": "Validasi gagal",
  "errors": [
    "harga harus berupa bilangan bulat > 0",
    "stok harus berupa bilangan bulat >= 0"
  ]
}
```

Data unik sudah ada (`409`):
```json
{
  "status": "error",
  "message": "Data unik sudah terdaftar"
}
```

`kategori_id` tidak ada di tabel kategori (`422`):
```json
{
  "status": "error",
  "message": "kategori_id tidak ditemukan di tabel kategori"
}
```

## Aturan Validasi

| Resource | Field | Aturan |
|---|---|---|
| kategori | nama_kategori | wajib, tidak kosong, maksimal 50 karakter |
| kategori | deskripsi | opsional, berupa teks, maksimal 200 karakter |
| produk | kategori_id | bilangan bulat >= 1 |
| produk | kode_produk | wajib, tidak kosong, maksimal 20 karakter |
| produk | nama_produk | wajib, tidak kosong, maksimal 100 karakter |
| produk | harga | bilangan bulat > 0 |
| produk | stok | bilangan bulat >= 0 |

Middleware validasi memakai pola dua fungsi: `validateKategori` dan `validateProduk` dipakai untuk POST dan PUT (semua field wajib), sedangkan `validatePatchProduk` dipakai untuk PATCH (hanya field yang dikirim yang diperiksa, dan body tanpa field valid ditolak 400). Middleware `parseId` memvalidasi `id` di URL dan menyimpannya di `req.id`.

## Format Respons

Sukses:
```json
{ "status": "success", "message": "...", "data": { } }
```
Respons daftar menambahkan `count`. Soft delete dan hard delete yang berhasil mengirim `204` tanpa isi.

Gagal:
```json
{ "status": "error", "message": "...", "errors": ["..."] }
```
Field `errors` hanya muncul untuk kegagalan validasi.

URL yang tidak dikenal dibalas `404` dengan pesan "Route tidak ditemukan". Error tak terduga dibalas `500` dengan pesan umum. Detail error hanya dicetak ke console, sehingga pesan internal PostgreSQL tidak bocor ke klien.

## Soft Delete dan Restore

- `DELETE /api/produk/:id` hanya mengisi `deleted_at = NOW()` lewat `UPDATE`. Baris tetap ada di tabel.
- Hanya baris dengan `deleted_at IS NULL` yang dianggap ada oleh API. Filter ini dipakai di GET daftar, GET by id, GET nested, PUT, PATCH, dan soft delete itu sendiri. Soft delete kedua pada id yang sama dibalas 404.
- `PATCH /api/produk/:id/restore` mengembalikan `deleted_at` menjadi `NULL`, hanya untuk baris yang sedang terhapus. Produk yang masih aktif atau tidak ada dibalas 404.

### Akibat soft delete pada hard delete kategori

Produk yang sudah di-soft delete tetap berada di tabel `produk` dan masih merujuk kategorinya lewat foreign key. Karena itu hard delete kategori tetap ditolak dengan **409** selama masih ada baris produk yang merujuknya, baik yang aktif maupun yang sudah di-soft delete. Dari sisi pengguna, kategori yang tampak kosong (semua produknya sudah dihapus) tetap tidak bisa dihapus. Ini disengaja: menjaga integritas relasi dan memastikan produk yang dihapus bisa dipulihkan (restore) tanpa kehilangan kategorinya.

### Keputusan desain: `kode_produk` milik baris yang di-soft delete

Constraint `UNIQUE` pada `kode_produk` berlaku untuk **semua baris**, termasuk yang sudah di-soft delete. Akibatnya kode milik produk terhapus tetap memicu **409** bila dipakai lagi oleh produk lain. Alasan memilih desain ini:

- Tidak ada dua produk dengan kode yang sama, sehingga restore selalu aman dan tidak menimbulkan konflik kode.
- Kode produk tetap menjadi identitas yang konsisten dan tidak berpindah ke barang lain.
- Implementasinya sederhana: cukup satu constraint `UNIQUE` di database, tanpa indeks parsial atau logika tambahan di aplikasi.

Konsekuensinya, kode produk yang pernah dipakai tidak bisa digunakan ulang sampai baris lamanya dihapus permanen dari database.

## Alasan Memilih PUT dan PATCH

Tabel produk memakai **keduanya** karena maknanya berbeda.

- **PUT** dipakai untuk mengganti seluruh data produk. Semua field wajib dikirim, dan body yang tidak lengkap ditolak `400`. Dengan begitu hasil akhirnya pasti sama dengan body yang dikirim: tidak ada field yang diam-diam tertinggal dari nilai lama, dan baris tidak bisa berakhir dalam keadaan setengah terisi. PUT juga idempoten, artinya mengirim request yang sama berulang kali menghasilkan data akhir yang sama. PUT cocok untuk formulir edit lengkap, saat klien memegang seluruh data produk.
- **PATCH** dipakai untuk mengubah sebagian field, misalnya hanya `stok` atau `harga`. Klien tidak perlu mengirim ulang data yang tidak berubah, request lebih ringan, dan lebih aman karena field yang tidak disebut tidak ikut tertimpa. Hal ini penting pada data yang sering berubah sebagian, seperti stok. PATCH dengan body kosong atau tanpa field yang dikenal ditolak `400`.

Karena aturannya berbeda, validasi dibuat dalam dua fungsi: `validateProduk` (semua field wajib, untuk POST dan PUT) dan `validatePatchProduk` (hanya field yang dikirim yang diperiksa, minimal satu field).

## Alasan Hard Delete pada Tabel Induk

Tabel `kategori` memakai **hard delete** (`DELETE FROM`), sedangkan tabel `produk` memakai soft delete.

- Kategori adalah data referensi (master) yang bentuknya sederhana, jarang berubah, dan tidak punya kebutuhan pemulihan seperti produk. Baris yang sudah tidak dipakai lebih tepat benar-benar dihapus daripada dibiarkan menumpuk sebagai "terhapus".
- Dengan hard delete, kolom `nama_kategori` yang `UNIQUE` tidak "terkunci" oleh baris mati. Nama kategori yang sudah dihapus bisa dipakai lagi tanpa konflik.
- Integritas data tetap terjaga oleh foreign key. Kategori yang masih dirujuk produk, baik aktif maupun yang sudah di-soft delete, tidak bisa dihapus: PostgreSQL melempar `23503` dan API membalas `409 Conflict` dengan pesan yang jelas. Hanya kategori yang benar-benar kosong yang bisa dihapus permanen (`204`), sehingga tidak ada produk yang kehilangan kategorinya.
- Produk berbeda karena merupakan data utama yang bisa terhapus secara tidak sengaja, sehingga masuk akal punya soft delete dan restore.

## Pengujian

Pengujian dilakukan dengan Postman Collection **UTS Pemrograman API** yang dijalankan lewat Collection Runner. Jalankan `sql/seed.sql` sebelum pengujian agar data berada pada kondisi awal. Data seed berisi 3 kategori dan 6 produk: produk 1 sampai 5 aktif, dan produk 6 (`ELK-004`) sudah di-soft delete. Kategori 3 tidak memiliki produk, sehingga bisa dipakai untuk menguji hard delete yang berhasil (204) dan daftar produk yang kosong (200).

const express = require('express');
const kategoriRoutes = require('./routes/kategoriRoutes');
const produkRoutes = require('./routes/produkRoutes');

const app = express();

app.use(express.json());

app.use('/api/kategori', kategoriRoutes);
app.use('/api/produk', produkRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route tidak ditemukan',
  });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'JSON tidak valid',
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'Data unik sudah terdaftar',
    });
  }
  if (err.code === '23503') {
    // Hapus induk yang masih dirujuk anak -> 409
    if (req.method === 'DELETE') {
      return res.status(409).json({
        status: 'error',
        message: 'Kategori masih dipakai oleh produk dan tidak dapat dihapus',
      });
    }
    // INSERT/UPDATE anak dengan kategori_id yang tidak ada -> 422
    return res.status(422).json({
      status: 'error',
      message: 'kategori_id tidak ditemukan di tabel kategori',
    });
  }
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
});

module.exports = app;

const router = require('express').Router();

const ctrl = require('../controllers/kategoriController');
const parseId = require('../middlewares/parseId');
const { validateKategori } = require('../middlewares/validateKategori');

// GET: Mengambil semua kategori
router.get('/', ctrl.getAll);

// GET: Mengambil kategori berdasarkan ID
router.get('/:id', parseId, ctrl.getById);

// GET: Mengambil produk aktif milik satu kategori
router.get('/:id/produk', parseId, ctrl.getProduk);

// POST: Menambahkan kategori baru
router.post('/', validateKategori, ctrl.create);

// DELETE: Menghapus kategori
router.delete('/:id', parseId, ctrl.remove);

module.exports = router;

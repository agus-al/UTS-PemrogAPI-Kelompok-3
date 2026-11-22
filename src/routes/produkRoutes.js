
const router = require('express').Router();

const ctrl = require('../controllers/produkController');
const parseId = require('../middlewares/parseId');

const {
  validateProduk,
  validatePatchProduk,
} = require('../middlewares/validateProduk');

// GET: Mengambil semua produk
router.get('/', ctrl.getAll);

// GET: Mengambil produk berdasarkan ID
router.get('/:id', parseId, ctrl.getById);

// POST: Menambahkan produk baru
router.post('/', validateProduk, ctrl.create);

// PUT: Mengganti seluruh data produk
router.put('/:id', parseId, validateProduk, ctrl.replace);

// PATCH: Mengubah sebagian data produk
router.patch('/:id', parseId, validatePatchProduk, ctrl.update);

// DELETE: Menghapus produk
router.delete('/:id', parseId, ctrl.remove);

// PATCH: Mengembalikan produk yang dihapus
router.patch('/:id/restore', parseId, ctrl.restore);

module.exports = router;

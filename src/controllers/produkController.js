
const repo = require('../repositories/produkRepository');

// CREATE: Menambahkan produk
exports.create = async (req, res, next) => {
  try {
    const data = await repo.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL: Mengambil semua produk
exports.getAll = async (req, res, next) => {
  try {
    const data = await repo.findAll();

    res.status(200).json({
      status: 'success',
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID: Mengambil produk berdasarkan ID
exports.getById = async (req, res, next) => {
  try {
    const data = await repo.findById(req.id);

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Produk id ${req.id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// REPLACE: Mengganti seluruh data produk
exports.replace = async (req, res, next) => {
  try {
    const data = await repo.replace(req.id, req.body);

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Produk id ${req.id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil diperbarui',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE: Mengubah sebagian data produk
exports.update = async (req, res, next) => {
  try {
    const data = await repo.update(req.id, req.body);

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Produk id ${req.id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil diubah',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE: Soft delete produk
exports.remove = async (req, res, next) => {
  try {
    const terhapus = await repo.softDelete(req.id);

    if (!terhapus) {
      return res.status(404).json({
        status: 'error',
        message: `Produk id ${req.id} tidak ditemukan`,
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// RESTORE: Mengembalikan produk yang dihapus
exports.restore = async (req, res, next) => {
  try {
    const data = await repo.restore(req.id);

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Produk id ${req.id} tidak ditemukan atau sudah aktif`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil dipulihkan',
      data,
    });
  } catch (err) {
    next(err);
  }
};

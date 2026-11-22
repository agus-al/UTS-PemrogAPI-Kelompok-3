const repo = require('../repositories/kategoriRepository');
const produkRepo = require('../repositories/produkRepository');

exports.create = async (req, res, next) => {
  try {
    const data = await repo.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil ditambahkan',
      data,
    });
  } catch (err) {
    next(err);
  }
};

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

exports.getById = async (req, res, next) => {
  try {
    const data = await repo.findById(req.id);
    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Kategori id ${req.id} tidak ditemukan`,
      });
    }
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

exports.getProduk = async (req, res, next) => {
  try {
    const kategori = await repo.findById(req.id);
    if (!kategori) {
      return res.status(404).json({
        status: 'error',
        message: `Kategori id ${req.id} tidak ditemukan`,
      });
    }
    const data = await produkRepo.findByKategori(req.id);
    res.status(200).json({
      status: 'success',
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const terhapus = await repo.remove(req.id);
    if (!terhapus) {
      return res.status(404).json({
        status: 'error',
        message: `Kategori id ${req.id} tidak ditemukan`,
      });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

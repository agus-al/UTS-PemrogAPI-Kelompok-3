const MAX_INT = 2147483647;

const adalahAngka = (v) =>
  (typeof v === 'number' && Number.isFinite(v)) ||
  (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)));

const bulat = (v) => adalahAngka(v) && Number.isInteger(Number(v));

const teksMaks = (maks) => (v) =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= maks;

const aturan = {
  kategori_id: (v) => bulat(v) && Number(v) >= 1 && Number(v) <= MAX_INT,
  kode_produk: teksMaks(20),
  nama_produk: teksMaks(100),
  harga: (v) => bulat(v) && Number(v) >= 1 && Number(v) <= MAX_INT,
  stok: (v) => bulat(v) && Number(v) >= 0 && Number(v) <= MAX_INT,
};

const pesan = {
  kategori_id: 'kategori_id harus berupa bilangan bulat >= 1',
  kode_produk: 'kode_produk wajib diisi (maksimal 20 karakter)',
  nama_produk: 'nama_produk wajib diisi (maksimal 100 karakter)',
  harga: 'harga harus berupa bilangan bulat > 0',
  stok: 'stok harus berupa bilangan bulat >= 0',
};

function validasi(body, parsial) {
  const errors = [];

  for (const f of Object.keys(aturan)) {
    if (parsial && body[f] === undefined) continue;

    if (!aturan[f](body[f])) {
      errors.push(pesan[f]);
    }
  }

  if (
    parsial &&
    Object.keys(aturan).every((f) => body[f] === undefined)
  ) {
    errors.push('Minimal satu field harus dikirim');
  }

  return errors;
}

const cek = (parsial) => (req, res, next) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const errors = validasi(body, parsial);

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validasi gagal',
      errors,
    });
  }

  next();
};

module.exports = {
  validateProduk: cek(false),
  validatePatchProduk: cek(true),
};


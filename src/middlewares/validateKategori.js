const aturan = {
  nama_kategori: (v) =>
    typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 50,
  deskripsi: (v) =>
    v === undefined ||
    v === null ||
    (typeof v === 'string' && v.length <= 200),
};

const pesan = {
  nama_kategori: 'nama_kategori wajib diisi (maksimal 50 karakter)',
  deskripsi: 'deskripsi harus berupa teks (maksimal 200 karakter)',
};

function validasi(body, parsial) {
  const errors = [];
  for (const f of Object.keys(aturan)) {
    if (parsial && body[f] === undefined) continue;
    if (!aturan[f](body[f])) errors.push(pesan[f]);
  }
  if (parsial && Object.keys(aturan).every((f) => body[f] === undefined)) {
    errors.push('minimal satu field harus dikirim');
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
  validateKategori: cek(false),
  validatePatchKategori: cek(true),
};

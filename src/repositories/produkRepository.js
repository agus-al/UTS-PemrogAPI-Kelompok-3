const pool = require('../config/db');

class ProdukRepository {
  async create({ kategori_id, kode_produk, nama_produk, harga, stok = 0 }) {
    const sql = `
      INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [kategori_id, kode_produk.trim(), nama_produk.trim(), harga, stok];
    const { rows } = await pool.query(sql, values);
    return rows[0];
  }

  async findAll() {
    const sql = `
      SELECT * FROM produk
      WHERE deleted_at IS NULL
      ORDER BY id
    `;
    const { rows } = await pool.query(sql);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT * FROM produk
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  async findByKategori(kategoriId) {
    const sql = `
      SELECT * FROM produk
      WHERE kategori_id = $1 AND deleted_at IS NULL
      ORDER BY id
    `;
    const { rows } = await pool.query(sql, [kategoriId]);
    return rows;
  }

  async replace(id, { kategori_id, kode_produk, nama_produk, harga, stok }) {
    const sql = `
      UPDATE produk
      SET kategori_id = $1, kode_produk = $2, nama_produk = $3, harga = $4, stok = $5
      WHERE id = $6 AND deleted_at IS NULL
      RETURNING *
    `;
    const values = [kategori_id, kode_produk.trim(), nama_produk.trim(), harga, stok, id];
    const { rows } = await pool.query(sql, values);
    return rows[0] || null;
  }

  async update(id, body) {
    const diizinkan = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];
    const kunci = Object.keys(body).filter((k) => diizinkan.includes(k));

    // Pengaman: tanpa field valid, SQL akan rusak (SET kosong)
    if (kunci.length === 0) return null;

    const set = kunci.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = [
      ...kunci.map((k) => (typeof body[k] === 'string' ? body[k].trim() : body[k])),
      id,
    ];

    const sql = `
      UPDATE produk
      SET ${set}
      WHERE id = $${kunci.length + 1} AND deleted_at IS NULL
      RETURNING *
    `;
    const { rows } = await pool.query(sql, values);
    return rows[0] || null;
  }

  async softDelete(id) {
    const sql = `
      UPDATE produk
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const { rowCount } = await pool.query(sql, [id]);
    return rowCount > 0;
  }

  async restore(id) {
    const sql = `
      UPDATE produk
      SET deleted_at = NULL
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = new ProdukRepository();

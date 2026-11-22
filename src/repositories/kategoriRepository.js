const pool = require('../config/db');

class KategoriRepository {
  async create({ nama_kategori, deskripsi = null }) {
    const sql = `
      INSERT INTO kategori (nama_kategori, deskripsi)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [nama_kategori.trim(), deskripsi]);
    return rows[0];
  }

  async findAll() {
    const sql = 'SELECT * FROM kategori ORDER BY id';
    const { rows } = await pool.query(sql);
    return rows;
  }

  async findById(id) {
    const sql = 'SELECT * FROM kategori WHERE id = $1';
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  async remove(id) {
    const sql = 'DELETE FROM kategori WHERE id = $1';
    const { rowCount } = await pool.query(sql, [id]);
    return rowCount > 0;
  }
}

module.exports = new KategoriRepository();

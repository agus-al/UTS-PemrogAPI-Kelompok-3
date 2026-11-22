require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const berkas = process.argv[2];

if (!berkas) {
  console.error('Pemakaian: node scripts/jalankan-sql.js sql/seed.sql');
  process.exit(1);
}

(async () => {
  try {
    const sql = fs.readFileSync(path.resolve(berkas), 'utf8');
    await pool.query(sql);
    console.log(`Berhasil menjalankan ${berkas}`);
  } catch (err) {
    console.error('Gagal:', err.message);
  } finally {
    await pool.end();
  }
})();

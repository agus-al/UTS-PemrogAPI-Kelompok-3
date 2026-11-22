-- Kosongkan data lama dan reset nomor id
TRUNCATE TABLE produk, kategori RESTART IDENTITY;

-- Tabel induk
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
  ('Elektronik', 'Perangkat elektronik dan gadget'),
  ('Pakaian', 'Pakaian pria, wanita, dan kasual'),
  ('Perlengkapan Rumah', 'Peralatan dan kebutuhan rumah tangga');

-- Tabel anak
INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok) VALUES
  (1, 'ELK-001', 'Mouse Wireless', 85000, 25),
  (1, 'ELK-002', 'Keyboard Mekanikal', 350000, 10),
  (1, 'ELK-003', 'Headset Bluetooth', 275000, 0),
  (2, 'PKN-001', 'Kaos Polos Katun', 65000, 100),
  (2, 'PKN-002', 'Celana Jeans Slim Fit', 220000, 40);

-- Produk yang sudah di-soft delete (untuk uji filter dan restore)
INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok, deleted_at) VALUES
  (1, 'ELK-004', 'Charger Fast Charging 20W', 120000, 15, NOW());
  

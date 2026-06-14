import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================================
// PENTING: TEMPELKAN URL KONEKSI EXTERNAL DARI RAILWAY ANDA DI SINI
// =========================================================================
const RAILWAY_CONNECTION_URL = 'mysql://root:eLZhsIIkNIkzIEflnKvbCjLdPsPCOscc@thomas.proxy.rlwy.net:38127/railway';

async function runMigration() {
  if (RAILWAY_CONNECTION_URL === 'TEMPEL_URL_EXTERNAL_DISINI') {
    console.error('❌ ERROR: Harap tempelkan External Connection URL dari Railway Anda pada variabel RAILWAY_CONNECTION_URL di dalam script ini!');
    process.exit(1);
  }

  console.log('⏳ Mencoba menghubungkan ke database MySQL Railway...');
  let connection;

  try {
    connection = await mysql.createConnection(RAILWAY_CONNECTION_URL);
    console.log('✅ Berhasil terhubung ke database Railway!');

    // 1. Membersihkan tabel lama agar migrasi bersih (fresh install)
    console.log('⏳ Membersihkan tabel-tabel lama jika ada...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToDrop = [
      'lost_found_claims',
      'lost_found',
      'inventory_loans',
      'inventory',
      'bookings',
      'rooms',
      'users'
    ];
    
    for (const table of tablesToDrop) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    console.log('✅ Pembersihan tabel lama selesai!');

    // 2. Membaca file schema.sql
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
    console.log(`⏳ Membaca file schema di: ${schemaPath}`);
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Hapus instruksi CREATE DATABASE dan USE secara bersih menggunakan Regex
    schemaSql = schemaSql
      .replace(/CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?\w+\s*;/gi, '')
      .replace(/USE\s+\w+\s*;/gi, '');

    console.log('⏳ Membuat tabel-tabel baru di database Railway...');
    
    // Pisahkan SQL berdasarkan karakter semicolon (;) untuk dieksekusi satu per satu
    const schemaQueries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const sqlQuery of schemaQueries) {
      await connection.query(sqlQuery);
    }
    console.log('✅ Semua tabel dan indeks berhasil dibuat!');

    // 3. Membaca file seed.sql
    const seedPath = path.join(__dirname, 'backend', 'database', 'seed.sql');
    console.log(`⏳ Membaca file seed di: ${seedPath}`);
    let seedSql = fs.readFileSync(seedPath, 'utf8');

    // Hapus instruksi USE secara bersih menggunakan Regex
    seedSql = seedSql.replace(/USE\s+\w+\s*;/gi, '');

    console.log('⏳ Mengimpor data awal (seeding) ke database Railway...');
    const seedQueries = seedSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const sqlQuery of seedQueries) {
      await connection.query(sqlQuery);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Semua data awal berhasil diimpor!');
    console.log('\n🎉 PROSES MIGRASI DATABASE Selesai dengan Sukses!');

  } catch (error) {
    console.error('❌ TERJADI KESALAHAN:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

runMigration();

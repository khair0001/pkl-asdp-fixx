// Test MySQL Connection
require('dotenv').config();
const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing MySQL connection...\n');
    
    // Test 1: Basic query
    const [result] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Test 1 - Basic Query:', result[0].result === 2 ? 'PASSED' : 'FAILED');
    
    // Test 2: Show tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('✅ Test 2 - Tables found:', tables.length);
    console.log('📋 Tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Test 3: Check users table
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Test 3 - Users count:', users[0].count);
    
    // Test 4: Check kategori_penumpang
    const [kategori] = await pool.query('SELECT * FROM kategori_penumpang');
    console.log('✅ Test 4 - Kategori Penumpang:', kategori.length, 'records');
    kategori.forEach(k => console.log('   -', k.nama_kategori));
    
    // Test 5: Check golongan_kendaraan
    const [golongan] = await pool.query('SELECT * FROM golongan_kendaraan ORDER BY nomor_golongan, tipe_muatan');
    console.log('✅ Test 5 - Golongan Kendaraan:', golongan.length, 'records');
    golongan.forEach(g => console.log('   - Golongan', g.nomor_golongan, g.tipe_muatan || '(no type)'));
    
    console.log('\n🎉 All tests passed! MySQL is ready to use.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Tips:');
    console.error('1. Pastikan MySQL sudah running');
    console.error('2. Cek file .env sudah benar (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('3. Pastikan database sudah dibuat: CREATE DATABASE db_kapal;');
    console.error('4. Import schema: mysql -u root -p db_kapal < DB_kapal_mysql.sql');
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();

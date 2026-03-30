const pool = require('../config/database');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Transaksi hari ini
      const [transaksiHariIniResult] = await pool.query(
        'SELECT COUNT(*) as count FROM produksi WHERE tanggal_produksi = ?',
        [today]
      );
      const transaksiHariIni = transaksiHariIniResult[0].count;

      // Transaksi bulan ini
      const [transaksiBulanIniResult] = await pool.query(
        'SELECT COUNT(*) as count FROM produksi WHERE MONTH(tanggal_produksi) = ? AND YEAR(tanggal_produksi) = ?',
        [currentMonth, currentYear]
      );
      const transaksiBulanIni = transaksiBulanIniResult[0].count;

      // Total kapal aktif
      const [totalKapalResult] = await pool.query(
        'SELECT COUNT(*) as count FROM kapal WHERE is_active = ?',
        [true]
      );
      const totalKapal = totalKapalResult[0].count;

      // Total perusahaan aktif
      const [totalPerusahaanResult] = await pool.query(
        'SELECT COUNT(*) as count FROM perusahaan WHERE is_active = ?',
        [true]
      );
      const totalPerusahaan = totalPerusahaanResult[0].count;

      res.json({
        data: {
          transaksiHariIni: transaksiHariIni || 0,
          transaksiBulanIni: transaksiBulanIni || 0,
          totalKapal: totalKapal || 0,
          totalPerusahaan: totalPerusahaan || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyRevenue(req, res, next) {
    try {
      const { month, year } = req.query;
      const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      console.log('Getting monthly revenue for:', { targetMonth, targetYear });

      // Get total production data for the target month
      const [produksiData] = await pool.query(
        'SELECT DAY(tanggal_produksi) as day, SUM(total_pendapatan) as total FROM produksi WHERE MONTH(tanggal_produksi) = ? AND YEAR(tanggal_produksi) = ? GROUP BY DAY(tanggal_produksi) ORDER BY day',
        [targetMonth, targetYear]
      );

      // Get ASDP production data for the target month
      const [produksiAsdpData] = await pool.query(
        `SELECT DAY(p.tanggal_produksi) as day, SUM(p.total_pendapatan) as total 
         FROM produksi p 
         JOIN perusahaan per ON p.perusahaan_id = per.perusahaan_id 
         WHERE MONTH(p.tanggal_produksi) = ? 
         AND YEAR(p.tanggal_produksi) = ? 
         AND LOWER(per.nama_perusahaan) LIKE '%asdp%'
         GROUP BY DAY(p.tanggal_produksi) 
         ORDER BY day`,
        [targetMonth, targetYear]
      );

      console.log('Produksi data count:', produksiData.length);
      console.log('Produksi ASDP data count:', produksiAsdpData.length);

      // Create revenue by date objects
      const revenueByDate = {};
      const revenueAsdpByDate = {};
      
      produksiData.forEach(item => {
        revenueByDate[item.day] = parseFloat(item.total || 0);
      });

      produksiAsdpData.forEach(item => {
        revenueAsdpByDate[item.day] = parseFloat(item.total || 0);
      });

      console.log('Revenue by date:', revenueByDate);
      console.log('Revenue ASDP by date:', revenueAsdpByDate);

      // Get number of days in the target month
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

      // Create array with all dates (1 to daysInMonth)
      const dailyRevenue = [];
      for (let day = 1; day <= daysInMonth; day++) {
        dailyRevenue.push({
          tanggal: day,
          total: revenueByDate[day] || 0,
          totalAsdp: revenueAsdpByDate[day] || 0
        });
      }

      console.log('Daily revenue array length:', dailyRevenue.length);

      res.json({
        data: {
          month: targetMonth,
          year: targetYear,
          dailyRevenue
        }
      });
    } catch (error) {
      console.error('Error in getMonthlyRevenue:', error);
      next(error);
    }
  }
}

module.exports = DashboardController;

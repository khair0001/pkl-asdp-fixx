const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const masterDataRoutes = require('./routes/masterData');
const produksiRoutes = require('./routes/produksi');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/produksi', produksiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ASDP API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;

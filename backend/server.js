require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const invoiceRoutes = require('./routes/invoiceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Smart Transport Billing System - Sri Mallikarjuna Transport',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Serve frontend static files if built
const path = require('path');
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// 404 Handler for unhandled API calls
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SRI MALLIKARJUNA TRANSPORT BILLING SERVER RUNNING`);
  console.log(`📡 Port: http://localhost:${PORT}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_transport_billing'}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Local NLP Rule Parser active'}`);
  console.log(`====================================================`);
});

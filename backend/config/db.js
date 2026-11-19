const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable Google DNS for SRV records if on cloud Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (_) {}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_transport_billing';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error('[MongoDB] Please ensure MongoDB service is running on mongodb://127.0.0.1:27017');
    process.exit(1);
  }
};

module.exports = connectDB;

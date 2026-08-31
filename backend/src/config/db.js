const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://satagopamharish_db_user:uKYbFmfF4SbQTKnT@cluster0.itxrjm7.mongodb.net/ai-yoga-coach?retryWrites=true&w=majority&appName=Cluster0';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection warning:', error.message);
    // Do not crash the entire server process so offline / local features remain operational
    return null;
  }
};

module.exports = connectDB;

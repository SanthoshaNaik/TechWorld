const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Diagnostic logging to inspect Render environment variables
    console.log('--- Database Diagnostics ---');
    console.log('MONGO_URI is defined:', !!process.env.MONGO_URI);
    console.log('MONGODB_URI is defined:', !!process.env.MONGODB_URI);
    const matchingKeys = Object.keys(process.env).filter(k => 
      k.toUpperCase().includes('MONGO') || 
      k.toUpperCase().includes('URI') || 
      k.toUpperCase().includes('URL')
    );
    console.log('Found matching environment keys:', matchingKeys);
    console.log('-----------------------------');

    const conn = await mongoose.connect(
      process.env.MONGO_URI || 
      process.env.MONGODB_URI || 
      'mongodb://localhost:27017/techworld'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

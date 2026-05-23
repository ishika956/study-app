const mongoose = require('mongoose');
const { resolveMongoUri } = require('./env');

const connectDB = async () => {
  const uri = resolveMongoUri();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

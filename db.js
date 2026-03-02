const mongoose = require('mongoose');
const { MONGO_URI } = require('./config/secret');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectDB;

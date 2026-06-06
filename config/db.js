const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await createIndexes();
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Order = require('../models/order.model');
    await Order.collection.createIndex({ created_at: -1, status: 1 });
    await Order.collection.createIndex({ token_number: 1, created_at: -1 });
    await Order.collection.createIndex({ student_phone: 1, created_at: -1 });
    console.log('Indexes created');
  } catch (err) {
    console.error('Index creation error:', err.message);
  }
};

module.exports = { connectDB };

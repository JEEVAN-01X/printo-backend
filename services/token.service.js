const Counter = require('../models/counter.model');

const getNextToken = async () => {
  const today = new Date().toISOString().split('T')[0];
  const key = `token_${today}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};

module.exports = { getNextToken };

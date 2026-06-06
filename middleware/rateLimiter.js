const rateLimit = require('express-rate-limit');

const orderRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.student_phone || req.ip,
  skip: (req) => !req.body.student_phone,
  validate: { keyGeneratorIpFallback: false },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'You have submitted the maximum 3 orders for today. Please collect your existing orders first.',
    });
  },
});

module.exports = orderRateLimiter;

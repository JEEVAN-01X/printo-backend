const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateOrder = require('../middleware/validate.order');
const orderRateLimiter = require('../middleware/rateLimiter');
const {
  createOrder, getTodayQueue, getByToken,
  getById, listOrders, updateStatus, cancelOrder,
} = require('../controllers/order.controller');

// SPECIFIC ROUTES FIRST
router.get('/queue/today', auth, getTodayQueue);
router.get('/token/:token', getByToken);
router.get('/', auth, listOrders);

// PARAMETERISED ROUTES LAST
router.get('/:id', auth, getById);
router.patch('/:id/status', auth, updateStatus);
router.patch('/:id/cancel', auth, cancelOrder);
router.post('/', orderRateLimiter, validateOrder, createOrder);

module.exports = router;

const Order = require('../models/order.model');
const ShopConfig = require('../models/shopConfig.model');
const { getNextToken } = require('../services/token.service');
const { sendOrderReady, sendOrderCancelled } = require('../services/sms.service');


const createOrder = async (req, res) => {
  try {
    const config = await ShopConfig.findOne();
    if (config && !config.is_accepting_orders) {
      return res.status(403).json({ success: false, error: 'Shop is currently closed.' });
    }

    const {
      student_name, student_phone, file_link,
      file_type, copies, color, double_sided, special_instructions,
    } = req.body;

    const token_number = await getNextToken();

    const order = await Order.create({
      token_number,
      student_name: student_name.trim(),
      student_phone,
      file_link,
      file_type,
      copies,
      color,
      double_sided,
      special_instructions: special_instructions || '',
    });

    const queuePosition = await Order.countDocuments({
      status: 'PENDING',
      created_at: { $gte: new Date().setHours(0,0,0,0) },
    });

    res.status(201).json({
      success: true,
      data: { order, queue_position: queuePosition },
    });

  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getTodayQueue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      created_at: { $gte: startOfDay },
      status: { $nin: ['COLLECTED', 'CANCELLED'] },
    }).sort({ token_number: 1 });

    res.json({ success: true, data: { orders } });
  } catch (err) {
    console.error('getTodayQueue error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getByToken = async (req, res) => {
  try {
    const token_number = parseInt(req.params.token);

    if (isNaN(token_number)) {
      return res.status(400).json({ success: false, error: 'Invalid token number' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const order = await Order.findOne({
      token_number,
      created_at: { $gte: startOfDay },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: { order } });
  } catch (err) {
    console.error('getByToken error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const listOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const filter = {
      created_at: { $gte: startOfDay, $lte: endOfDay },
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('listOrders error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PRINTING', 'READY', 'COLLECTED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const update = { status };
    if (status === 'READY') update.ready_at = new Date();
    if (status === 'COLLECTED') update.collected_at = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (status === 'READY' && !order.sms_sent) {
      await Order.findByIdAndUpdate(req.params.id, { sms_sent: true });
      updatedOrder.sms_sent = true; // ← fix: keep response in sync with DB
      try {
        await sendOrderReady(updatedOrder);
      } catch (smsErr) {
        console.error('SMS failed:', smsErr.message);
      }
    }

    res.json({ success: true, data: { order: updatedOrder } });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!['PENDING', 'PRINTING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel an order with status ${order.status}.`,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'CANCELLED' },
      { new: true }
    );

    if (!order.sms_sent) {
      await Order.findByIdAndUpdate(req.params.id, { sms_sent: true });
      updatedOrder.sms_sent = true; // ← fix: keep response in sync with DB
      try {
        await sendOrderCancelled(updatedOrder);
      } catch (smsErr) {
        console.error('SMS failed:', smsErr.message);
      }
    }

    res.json({ success: true, data: { order: updatedOrder } });
  } catch (err) {
    console.error('cancelOrder error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: { order } });
  } catch (err) {
    console.error('getById error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getTodayQueue,
  getByToken,
  getById,
  listOrders,
  updateStatus,
  cancelOrder,
};

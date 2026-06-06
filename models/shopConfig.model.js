const mongoose = require('mongoose');

const shopConfigSchema = new mongoose.Schema({
  shop_name: { type: String, default: 'Printo' },
  is_accepting_orders: { type: Boolean, default: true },
  bw_price_per_page: { type: Number, default: 1.5 },
  colour_price_per_page: { type: Number, default: 10 },
});

module.exports = mongoose.model('ShopConfig', shopConfigSchema);

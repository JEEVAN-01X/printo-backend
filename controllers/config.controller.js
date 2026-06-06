const ShopConfig = require('../models/shopConfig.model');

const getConfig = async (req, res) => {
  try {
    let config = await ShopConfig.findOne();

    if (!config) {
      config = await ShopConfig.create({});
    }

    res.json({ success: true, data: { config } });
  } catch (err) {
    console.error('getConfig error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateConfig = async (req, res) => {
  try {
    const { is_accepting_orders, bw_price_per_page, colour_price_per_page } = req.body;

    const config = await ShopConfig.findOneAndUpdate(
      {},
      { is_accepting_orders, bw_price_per_page, colour_price_per_page },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: { config } });
  } catch (err) {
    console.error('updateConfig error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { getConfig, updateConfig };

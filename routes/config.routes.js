const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getConfig, updateConfig } = require('../controllers/config.controller');

router.get('/', getConfig);
router.patch('/', auth, updateConfig);

module.exports = router;

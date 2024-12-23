const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.post('/settings', auth, alertController.saveSettings);
router.get('/settings', auth, alertController.getSettings);

module.exports = router; 
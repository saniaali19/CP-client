const express = require('express');
const router = express.Router();
const glucoseController = require('../controllers/glucoseController');
const auth = require('../middleware/auth');

router.get('/', auth, glucoseController.getReadings);
router.post('/', auth, glucoseController.addReading);
router.put('/:id', auth, glucoseController.updateReading);
router.delete('/:id', auth, glucoseController.deleteReading);

module.exports = router;
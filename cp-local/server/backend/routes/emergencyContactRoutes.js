const express = require('express');
const router = express.Router();
const emergencyContactController = require('../controllers/emergencyContactController');
const auth = require('../middleware/auth');

router.get('/patients', auth, emergencyContactController.getPatients);

module.exports = router;
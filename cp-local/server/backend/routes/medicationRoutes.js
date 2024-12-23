const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const auth = require('../middleware/auth');

router.get('/', auth, medicationController.getMedications);
router.post('/', auth, medicationController.addMedication);
router.put('/:id', auth, medicationController.updateMedication);
router.delete('/:id', auth, medicationController.deleteMedication);

module.exports = router;
const mongoose = require('mongoose');

const medicationScheduleSchema = new mongoose.Schema({
  time: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    daysOfWeek: [{
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }]
});


const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  schedules: [medicationScheduleSchema],
  notes: String,
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
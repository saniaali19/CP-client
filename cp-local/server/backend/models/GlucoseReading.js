const mongoose = require('mongoose');

const glucoseReadingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String,
  mealStatus: {
    type: String,
    enum: ['before_meal', 'after_meal', 'fasting', 'other'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('GlucoseReading', glucoseReadingSchema);
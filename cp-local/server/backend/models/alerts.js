const mongoose = require('mongoose');

const alertSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    accountId: {  
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  thresholds: {
    lowThreshold: {
      type: Number,
      required: true,
      default: 70
    },
    highThreshold: {
      type: Number,
      required: true,
      default: 180
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('AlertSettings', alertSettingsSchema);
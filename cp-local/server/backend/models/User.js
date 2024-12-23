const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
   userType: {
    type: String,
    enum: ['patient', 'emergency_contact'],
    default: 'patient'
  },
   emergencyContact: {
    name: String,
    phone: String,
    email: String
  },
  emergencyContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  monitoringFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dangerousLevels: {
    lowThreshold: {
      type: Number,
      default: 70
    },
    highThreshold: {
      type: Number,
      default: 180
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const User = require('../models/User');
const GlucoseReading = require('../models/GlucoseReading');

exports.getPatients = async (req, res) => {
  try {
    //get emergency contact user details
    const emergencyContact = await User.findById(req.user.userId)
      .populate('monitoringFor');

    if (!emergencyContact || emergencyContact.userType !== 'emergency_contact') {
      return res.status(403).json({ message: 'Not authorized as emergency contact' });
    }

    //get latest readings and process patient data
    const patients = await Promise.all(emergencyContact.monitoringFor.map(async (patient) => {
      const latestReading = await GlucoseReading.findOne({ userId: patient._id })
        .sort({ timestamp: -1 });

      let status = 'normal';
      if (latestReading) {
        if (latestReading.level <= patient.dangerousLevels.lowThreshold) {
          status = 'danger';
        } else if (latestReading.level >= patient.dangerousLevels.highThreshold) {
          status = 'danger';
        } else if (latestReading.level <= patient.dangerousLevels.lowThreshold + 10 ||
                   latestReading.level >= patient.dangerousLevels.highThreshold - 10) {
          status = 'warning';
        }
      }

      return {
        _id: patient._id,
        name: patient.name,
        status,
        lastReading: latestReading ? {
          level: latestReading.level,
          timestamp: latestReading.timestamp
        } : null,
        dangerousLevels: patient.dangerousLevels
      };
    }));

    //get active alerts
    const alerts = [];
    for (const patient of patients) {
      if (patient.status === 'danger' && patient.lastReading) {
        alerts.push({
          _id: `${patient._id}-${Date.now()}`,
          patientName: patient.name,
          type: patient.lastReading.level <= patient.dangerousLevels.lowThreshold ? 
            'LOW_GLUCOSE' : 'HIGH_GLUCOSE',
          message: `Glucose level (${patient.lastReading.level} mg/dL) is outside target range`,
          timestamp: patient.lastReading.timestamp
        });
      }
    }

    res.json({
      patients,
      alerts
    });

  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).json({ message: 'Error fetching patient data' });
  }
};
const GlucoseReading = require('../models/GlucoseReading');
const AlertSettings = require('../models/alerts');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
});

const verifyEmailSetup = async () => {
  try {
    await transporter.verify();
    console.log('Email configuration verified successfully');
  } catch (error) {
    
    console.error('Email verification failed:', error);
  }
};

verifyEmailSetup();


const checkAndSendAlert = async (userId, glucoseLevel) => {
  try {
    console.log('Checking alerts for patient ID:', userId);
    const settings = await AlertSettings.findOne({ userId });
    
    if (!settings || !settings.emergencyContact || !settings.emergencyContact.email) {
      console.log('No alert settings or emergency contact found for user:', userId);
      return;
    }

    console.log('Found alert settings:', settings);
    const isLow = glucoseLevel <= settings.thresholds.lowThreshold;
    const isHigh = glucoseLevel >= settings.thresholds.highThreshold;

    if (isLow || isHigh) {
      const condition = isLow ? 'LOW' : 'HIGH';
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: settings.emergencyContact.email,
        subject: `URGENT: ${condition} Glucose Level Alert`,
        html: `
          <h2>Glucose Level Alert</h2>
          <p>This is an automated alert regarding your contact's glucose levels.</p>
          <p><strong>Current Reading:</strong> ${glucoseLevel} mg/dL</p>
          <p><strong>Status:</strong> ${condition} (Outside normal range of ${settings.thresholds.lowThreshold}-${settings.thresholds.highThreshold} mg/dL)</p>
          <p><strong>Contact Information:</strong></p>
          <ul>
            <li>Name: ${settings.emergencyContact.name}</li>
            <li>Phone: ${settings.emergencyContact.phone}</li>
          </ul>
          <p>Please check on them as soon as possible.</p>
        `
      };
        const result = await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully:', result.messageId);
        return result;
        }

        console.log('Glucose level within normal range, no alert needed');
        return null;
        } catch (error) {
        console.error('Error sending alert email:', error);
        throw error;
        }
    };

//get all readings for a user
exports.getReadings = async (req, res) => {
    try {
        const readings = await GlucoseReading.find({ userId: req.user.userId })
            .sort({ timestamp: -1 });
        res.json(readings);
    } catch (error) {
      console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//add new reading
exports.addReading = async (req, res) => {
    try {

      if (req.user.userType !== 'patient') {
            return res.status(403).json({ 
                message: 'Only patients can add readings' 
            });
        }
        
        const { level, mealStatus, notes } = req.body;
        const userId = req.user.userId;

        console.log('Adding reading for user:', {
            userId,
            userType: req.user.userType,
            level
        });

         if (req.user.userType !== 'patient') {
            return res.status(403).json({ 
                message: 'Only patients can add readings' 
            });
        }
        
        const reading = new GlucoseReading({
            userId,
            level,
            mealStatus,
            notes,
            timestamp: new Date()
        });
        await reading.save();
        console.log('New reading saved for patient:', userId);
       try {
      await checkAndSendAlert(userId, level);
    } catch (alertError) {
      console.error('Failed to send alert, but reading was saved:', alertError);
    }

    res.status(201).json(reading);
  } catch (error) {
    console.error('Error adding glucose reading:', error);
    res.status(500).json({ message: 'Failed to save glucose reading' });
  }
};

//update reading
exports.updateReading = async (req, res) => {
    try {
        const reading = await GlucoseReading.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        if (!reading) {
            return res.status(404).json({ message: 'Reading not found' });
        }
        res.json(reading);
    } catch (error) {
      console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//delete reading
exports.deleteReading = async (req, res) => {
    try {
        const reading = await GlucoseReading.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        if (!reading) {
            return res.status(404).json({ message: 'Reading not found' });
        }
        res.json({ message: 'Reading deleted' });
    } catch (error) {
      console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};





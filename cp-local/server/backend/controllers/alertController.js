const AlertSettings = require('../models/alerts.js');
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error) {
  if (error) {
    console.log('Error verifying email setup:', error);
    console.log('Email config:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '[PRESENT]' : '[MISSING]'
    });
  } else {
    console.log('Email server is ready to send messages');
  }
});

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

const alertController = {
  saveSettings: async (req, res) => {
    try {
      const { emergencyContact, thresholds } = req.body;
      const userId = req.user.userId;
      console.log('Starting saveSettings with:', { emergencyContact, userId });

      //Checking if emergency contact already has an account first
      let emergencyContactUser = await User.findOne({ 
        email: emergencyContact.email 
      });

      console.log('Existing emergency contact:', emergencyContactUser);

      //If no account exists, create one
      if (!emergencyContactUser) {
        const temporaryPassword = generateRandomPassword();
        console.log('Generated temporary password:', temporaryPassword);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        emergencyContactUser = new User({
          email: emergencyContact.email,
          password: hashedPassword,
          name: emergencyContact.name,
          userType: 'emergency_contact',
          monitoringFor: [userId]
        });
        console.log('Created new emergency contact user:', emergencyContactUser);
        await emergencyContactUser.save();

        //Send email to emergency contact with their credentials
        const emailContent = `
          <h2>Emergency Contact Access Created</h2>
          <p>Hello ${emergencyContact.name},</p>
          <p>You have been designated as an emergency contact for glucose monitoring.</p>
          <p>An account has been created for you with the following credentials:</p>
          <p>Email: ${emergencyContact.email}</p>
          <p>Temporary Password: ${temporaryPassword}</p>
          <p>Please log in at <a href="http://localhost:5173/login">http://localhost:5173/login</a> and change your password.</p>
          <p>You will receive alerts when glucose levels require attention.</p>
        `;
        console.log('Attempting to send email to:', emergencyContact.email);
        try {
        const result = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emergencyContact.email,
          subject: 'Emergency Contact Account Created',
          html: emailContent
        });
        console.log('Email sent successfully:', result);
      } catch (emailError){
         console.error('Error sending email:', emailError);
      }
      } else {
        //If emergency contact account exists, add patient to their monitoring list
        if (!emergencyContactUser.monitoringFor.includes(userId)) {
          emergencyContactUser.monitoringFor.push(userId);
          await emergencyContactUser.save();
        }
      }

      //Update patient's emergency contact reference
      await User.findByIdAndUpdate(userId, {
        emergencyContactId: emergencyContactUser._id
      });

      //Save alert settings
      const alertSettings = await AlertSettings.findOneAndUpdate(
        { userId },
        { 
          userId,
          emergencyContact: {
            ...emergencyContact,
            accountId: emergencyContactUser._id
          },
          thresholds 
        },
        { new: true, upsert: true }
      );

      res.json(alertSettings);
    } catch (error) {
      console.error('Error saving alert settings:', error);
      res.status(500).json({ 
        message: 'Error saving alert settings', 
        error: error.message 
      });
    }
  },

  getSettings: async (req, res) => {
    try {
      const userId = req.user.userId;
      const settings = await AlertSettings.findOne({ userId });
      res.json(settings || {});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error fetching alert settings' });
    }
  }
};

module.exports = alertController;
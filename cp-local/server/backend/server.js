require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const glucoseRoutes = require ('./routes/glucoseRoutes');
const medicationRoutes = require ('./routes/medicationRoutes');
const alertRoutes = require ('./routes/alertRoutes');



const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

//routes
app.use('/api/users', userRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/emergency-contact', require('./routes/emergencyContactRoutes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
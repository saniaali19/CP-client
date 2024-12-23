const Medication = require('../models/Medication');

//get all medications for a user
exports.getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.user.userId })
            .sort({ name: 1 });
        res.json(medications);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//add new medication
exports.addMedication = async (req, res) => {
    try {
        const { name, type, schedules, notes } = req.body;
        console.log('Received medication data:', req.body);
        const medication = new Medication({
            userId: req.user.userId,
            name,
            type,
             schedules: schedules.map(schedule => ({
                time: schedule.time,
                dosage: schedule.dosage,
                daysOfWeek: schedule.daysOfWeek
            })),
            notes
        });
       const savedMedication = await medication.save();
        console.log('Saved medication:', savedMedication); 
        
        res.status(201).json(savedMedication);
    } catch (error) {
        console.error('Error saving medication:', error); 
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//update medication
exports.updateMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.json(medication);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//delete medication
exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.json({ message: 'Medication deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
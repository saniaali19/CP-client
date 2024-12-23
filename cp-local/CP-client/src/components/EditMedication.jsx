import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  IconButton,
  Typography
} from '@mui/material';
import { StyledDialog, dialogProps } from './StyledDialog';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import axios from 'axios';
import PropTypes from 'prop-types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditMedication = ({ open, handleClose, medication, onMedicationUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    notes: '',
    schedules: [{ time: '', dosage: '', daysOfWeek: [] }]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        type: medication.type,
        notes: medication.notes || '',
        schedules: medication.schedules?.length > 0 
          ? medication.schedules 
          : [{ time: '', dosage: '', daysOfWeek: [] }]
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value
    };
    setFormData({
      ...formData,
      schedules: newSchedules
    });
  };

  const handleDayChange = (scheduleIndex, day) => {
    const newSchedules = [...formData.schedules];
    const currentDays = newSchedules[scheduleIndex].daysOfWeek;
    
    if (currentDays.includes(day)) {
      newSchedules[scheduleIndex].daysOfWeek = currentDays.filter(d => d !== day);
    } else {
      newSchedules[scheduleIndex].daysOfWeek = [...currentDays, day];
    }
    
    setFormData({
      ...formData,
      schedules: newSchedules
    });
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { time: '', dosage: '', daysOfWeek: [] }]
    });
  };

  const removeSchedule = (index) => {
    const newSchedules = formData.schedules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      schedules: newSchedules
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/medications/${medication._id}`,
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      onMedicationUpdated(response.data);
      handleClose();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating medication');
    }
  };

  const handleDialogClose = () => {
    setFormData({
      name: '',
      type: '',
      notes: '',
      schedules: [{ time: '', dosage: '', daysOfWeek: [] }]
    });
    setError('');
    handleClose();
  };

  return (
    <StyledDialog 
    open={open} 
    onClose={handleClose} 
    maxWidth="sm" 
    fullWidth
    aria-labelledby="edit-medication-dialog-title"
    {...dialogProps}
  >
    <DialogTitle id="edit-medication-dialog-title">Edit Medication</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              name="name"
              label="Medication Name"
              value={formData.name}
              onChange={handleChange}
            />

            <FormControl required>
              <InputLabel>Medication Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Medication Type"
                onChange={handleChange}
              >
                <MenuItem value="insulin">Insulin</MenuItem>
                <MenuItem value="oral">Oral Medication</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Schedule
            </Typography>

            {formData.schedules.map((schedule, scheduleIndex) => (
              <Box 
                key={scheduleIndex} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  p: 2, 
                  border: '1px solid #ddd', 
                  borderRadius: 1 
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    required
                    label="Time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange(scheduleIndex, 'time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    sx={{ width: '150px' }}
                  />
                  <TextField
                    required
                    label="Dosage"
                    value={schedule.dosage}
                    onChange={(e) => handleScheduleChange(scheduleIndex, 'dosage', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  {scheduleIndex > 0 && (
                    <IconButton onClick={() => removeSchedule(scheduleIndex)} color="error">
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day}
                      variant={schedule.daysOfWeek.includes(day) ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleDayChange(scheduleIndex, day)}
                      sx={{ minWidth: '80px' }}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addSchedule}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Schedule
            </Button>

            <TextField
              name="notes"
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update Medication
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

EditMedication.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  medication: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    notes: PropTypes.string,
    schedules: PropTypes.arrayOf(PropTypes.shape({
      time: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired,
      daysOfWeek: PropTypes.arrayOf(PropTypes.string).isRequired
    })).isRequired
  }).isRequired,
  onMedicationUpdated: PropTypes.func.isRequired
};

export default EditMedication;
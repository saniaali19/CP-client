import React, { useState } from 'react';
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
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { StyledDialog,dialogProps } from './StyledDialog';
import axios from 'axios';
import PropTypes from 'prop-types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AddMedication = ({ open, handleClose, onMedicationAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    notes: '',
    schedules: [{
      time: '',
      dosage: '',
      daysOfWeek: []
    }]
  });
  const [error, setError] = useState('');

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
      console.log('Submitting medication data:', formData);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/medications',
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      console.log('Server response:', response.data);

      onMedicationAdded(response.data);
      handleClose();
      setFormData({
        name: '',
        type: '',
        notes: '',
        schedules: [{ time: '', dosage: '', daysOfWeek: [] }]
      });
      setError('');
    } catch (err) {
      console.error('Error:', err.response || err);
      setError(err.response?.data?.message || 'Error adding medication');
    }
  };

  return (
<StyledDialog 
    open={open} 
    onClose={handleClose} 
    maxWidth="sm" 
    fullWidth
    aria-labelledby="add-medication-dialog-title"
    {...dialogProps}
  >
    <DialogTitle id="add-medication-dialog-title">Add Medication</DialogTitle>

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
                
                <FormGroup row>
                  {DAYS_OF_WEEK.map((day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={schedule.daysOfWeek.includes(day)}
                          onChange={() => handleDayChange(scheduleIndex, day)}
                        />
                      }
                      label={day.slice(0, 3)}
                    />
                  ))}
                </FormGroup>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Medication
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

AddMedication.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onMedicationAdded: PropTypes.func.isRequired
};

export default AddMedication;
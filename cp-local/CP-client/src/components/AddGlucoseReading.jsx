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
  Alert
} from '@mui/material';
import { StyledDialog, dialogProps } from './StyledDialog';
import axios from 'axios';
import PropTypes from 'prop-types';

const AddGlucoseReading = ({ open, handleClose, onReadingAdded }) => {
  const [formData, setFormData] = useState({
    level: '',
    mealStatus: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/glucose',
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      onReadingAdded(response.data);
      handleClose();
      setFormData({ level: '', mealStatus: '', notes: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding reading');
    }
  };

  return (
      <StyledDialog 
    open={open} 
    onClose={handleClose} 
    maxWidth="sm" 
    fullWidth
    aria-labelledby="add-glucose-dialog-title"
     {...dialogProps}
  >
    <DialogTitle id="add-glucose-dialog-title">Add Glucose Reading</DialogTitle>

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
              name="level"
              label="Glucose Level (mg/dL)"
              type="number"
              value={formData.level}
              onChange={handleChange}
              inputProps={{ min: 0, max: 600 }}
            />

            <FormControl required>
              <InputLabel>Meal Status</InputLabel>
              <Select
                name="mealStatus"
                value={formData.mealStatus}
                label="Meal Status"
                onChange={handleChange}
              >
                <MenuItem value="before_meal">Before Meal</MenuItem>
                <MenuItem value="after_meal">After Meal</MenuItem>
                <MenuItem value="fasting">Fasting</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

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
            Add Reading
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

AddGlucoseReading.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onReadingAdded: PropTypes.func.isRequired
};

export default AddGlucoseReading;
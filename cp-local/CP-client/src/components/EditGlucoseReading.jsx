import React, { useState, useEffect} from 'react';
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

const EditGlucoseReading = ({ open, handleClose, reading, onReadingUpdated }) => {
  const [formData, setFormData] = useState({
    level: reading?.level || '',
    mealStatus: reading?.mealStatus || '',
    notes: reading?.notes || ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (reading) {
      setFormData({
        level: reading.level,
        mealStatus: reading.mealStatus,
        notes: reading.notes || ''
      });
    }
  }, [reading]);
  
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
      const response = await axios.put(
        `http://localhost:8000/api/glucose/${reading._id}`,
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      onReadingUpdated(response.data);
      handleClose();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating reading');
    }
  };

   const handleDialogClose = () => {
    setFormData({
      level: '',
      mealStatus: '',
      notes: ''
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
    aria-labelledby="edit-glucose-dialog-title"
    {...dialogProps}
  >
    <DialogTitle id="edit-glucose-dialog-title">Edit Glucose Reading</DialogTitle>
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
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update Reading
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

EditGlucoseReading.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  reading: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    mealStatus: PropTypes.string.isRequired,
    notes: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  onReadingUpdated: PropTypes.func.isRequired
};

export default EditGlucoseReading;
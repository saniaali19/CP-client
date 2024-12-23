import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { StyledDialog, dialogProps } from './StyledDialog';
import axios from 'axios';
import PropTypes from 'prop-types';


const AlertSettings = ({ open, handleClose, onSettingsSaved }) => {
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [thresholds, setThresholds] = useState({
    lowThreshold: 70,
    highThreshold: 180
  });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/alerts/settings', {
        emergencyContact,
        thresholds
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setMessage('Alert settings saved successfully!');
      setOpenSnackbar(true);
      if (onSettingsSaved) {
        onSettingsSaved(response.data);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving alert settings:', error);
      setMessage('Failed to save alert settings.');
      setOpenSnackbar(true);
    }
  };

  return (
    <>
    <StyledDialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="alert-settings-title"
        {...dialogProps}
      >
        <DialogTitle id="alert-settings-title">Alert Settings</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({
                    ...emergencyContact,
                    name: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Contact Email"
                  value={emergencyContact.email}
                  onChange={(e) => setEmergencyContact({
                    ...emergencyContact,
                    email: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="tel"
                  label="Contact Phone"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact({
                    ...emergencyContact,
                    phone: e.target.value
                  })}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Glucose Thresholds (mg/dL)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Low Threshold"
                  value={thresholds.lowThreshold}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    lowThreshold: parseInt(e.target.value)
                  })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="High Threshold"
                  value={thresholds.highThreshold}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    highThreshold: parseInt(e.target.value)
                  })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </StyledDialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={message.includes('successfully') ? 'success' : 'error'}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

AlertSettings.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSettingsSaved: PropTypes.func.isRequired
};


export default AlertSettings;
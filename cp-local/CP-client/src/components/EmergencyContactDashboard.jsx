import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const EmergencyDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientsData();
    //Poll for updates every 30 seconds
    const interval = setInterval(fetchPatientsData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const userType = localStorage.getItem('userType');
  if (userType === 'patient') {
    navigate('/dashboard');
  }
}, [navigate]);

  const fetchPatientsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/emergency-contact/patients', {
        headers: {
          'x-auth-token': token
        }
      });
      setPatients(response.data.patients);
      setAlerts(response.data.alerts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  }
};

  return (
     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 4,
      backgroundColor: 'white',
      borderRadius: 2,
      p: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Emergency Contact Dashboard
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ 
          borderRadius: 2,
          px: 3,
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)'
          }
        }}
      >
        Logout
      </Button>
    </Box>

      {/* Active Alerts Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Active Alerts
        </Typography>
        {alerts.length === 0 ? (
          <Alert severity="success">
            No active alerts - all patients are within their target ranges
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {alerts.map((alert) => (
              <Grid item xs={12} key={alert._id}>
                <Alert 
                  severity={alert.type === 'HIGH_GLUCOSE' ? 'error' : 'warning'}
                  sx={{ '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="subtitle1" component="div">
                        {alert.patientName}
                      </Typography>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                    </div>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Patients Overview Section */}
      <Typography variant="h6" gutterBottom>
        Monitored Patients
      </Typography>
      <Grid container spacing={3}>
        {patients.map((patient) => (
          <Grid item xs={12} md={6} key={patient._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {patient.name}
                  </Typography>
                  <Chip
                    label={patient.status}
                    color={getStatusColor(patient.status)}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Last Reading:
                </Typography>
                {patient.lastReading ? (
                  <>
                    <Typography variant="body1">
                      {patient.lastReading.level} mg/dL
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(patient.lastReading.timestamp).toLocaleString()}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No readings available
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Target Range: {patient.dangerousLevels.lowThreshold} - {patient.dangerousLevels.highThreshold} mg/dL
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EmergencyDashboard;
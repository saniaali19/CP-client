import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider 
} from '@mui/material';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import axios from 'axios';
import AddGlucoseReading from './AddGlucoseReading';
import AddMedication from './AddMedication';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import EditGlucoseReading from './EditGlucoseReading';
import EditMedication from './EditMedication';
import LogoutIcon from '@mui/icons-material/Logout';
import AlertSettings from './AlertSettings';
import { useNavigate } from 'react-router-dom';
import GenerateReport from './GenerateReport';



const Dashboard = () => {
  const [glucoseReadings, setGlucoseReadings] = useState([]);
  const [medications, setMedications] = useState([]);
  const [setLoading] = useState(true);
  const [openGlucoseForm, setOpenGlucoseForm] = useState(false);
  const [openMedicationForm, setOpenMedicationForm] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [openEditMedicationForm, setOpenEditMedicationForm] = useState(false);
  const [openAlertSettings, setOpenAlertSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        //fetching glucose readings
        const readingsResponse = await axios.get('http://localhost:8000/api/glucose', { headers });
        setGlucoseReadings(readingsResponse.data);

        //fetching medications
        const medicationsResponse = await axios.get('http://localhost:8000/api/medications', { headers });
        console.log('Medications data:', medicationsResponse.data);
        setMedications(medicationsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
  const userType = localStorage.getItem('userType');
  if (userType === 'emergency_contact') {
    navigate('/emergency-dashboard');
  }
}, [navigate])

  const handleAddReading = (newReading) => {
  setGlucoseReadings([...glucoseReadings, newReading]);
};

const handleAddMedication = (newMedication) => {
  setMedications([...medications, newMedication]);
};

  //formatting glucose readings for the chart
  const chartData = glucoseReadings
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(reading => ({
      timestamp: new Date(reading.timestamp).toLocaleDateString(),
      level: reading.level,
      mealStatus: reading.mealStatus
    }));

  const getLatestReading = () => {
    if (glucoseReadings.length === 0) return null;
    return glucoseReadings.reduce((latest, current) => 
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );
  };

  const latestReading = getLatestReading();

  const handleEditReading = (reading) => {
  setSelectedReading(reading);
  setOpenEditForm(true);
};

const handleUpdateReading = (updatedReading) => {
  setGlucoseReadings(glucoseReadings.map(reading => 
    reading._id === updatedReading._id ? updatedReading : reading
  ));
  setOpenEditForm(false);
  setSelectedReading(null);
};

const handleDeleteReading = async (readingId) => {
  if (window.confirm('Are you sure you want to delete this reading?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/glucose/${readingId}`, {
        headers: { 'x-auth-token': token }
      });
      setGlucoseReadings(glucoseReadings.filter(reading => reading._id !== readingId));
    } catch (error) {
      console.error('Error deleting reading:', error);
    }
  }
};

const handleEditMedication = (medication) => {
  setSelectedMedication(medication);
  setOpenEditMedicationForm(true);
};

const handleUpdateMedication = (updatedMedication) => {
  setMedications(medications.map(med => 
    med._id === updatedMedication._id ? updatedMedication : med
  ));
  setOpenEditMedicationForm(false);
  setSelectedMedication(null);
};

const handleDeleteMedication = async (medicationId) => {
  if (window.confirm('Are you sure you want to delete this medication?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/medications/${medicationId}`, {
        headers: { 'x-auth-token': token }
      });
      setMedications(medications.filter(med => med._id !== medicationId));
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  }
};

const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userType'); 
    navigate('/login');
  }
};

 return (
    <Container maxWidth="lg" sx={{ p: 4 }}>
      {/* Header */}
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
          Glucose Monitoring Dashboard
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

      {/* Action Buttons */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Button
          variant="contained"
          onClick={() => setOpenGlucoseForm(true)}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)'
            }
          }}
        >
          Add Glucose Reading
        </Button>
        <Button
          variant="contained"
          onClick={() => setOpenMedicationForm(true)}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)'
            }
          }}
        >
          Add Medication
        </Button>
       <Button
        variant="contained"
        onClick={() => setOpenAlertSettings(true)}
        sx={{ 
          borderRadius: 2,
          px: 4,
          py: 1.5,
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)'
          }
        }}
      >
        Alert Settings
      </Button>

      <GenerateReport 
        glucoseReadings={glucoseReadings} 
        medications={medications} 
      />
      </Box>

      <Grid container spacing={3}>
        {/* Latest Reading Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4,
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6">
                Latest Reading
              </Typography>
              {latestReading && (
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditReading(latestReading)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteReading(latestReading._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            {latestReading ? (
              <Box>
                <Typography variant="h3" color="primary">
                  {latestReading.level} mg/dL
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(latestReading.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Status: {latestReading.mealStatus.replace('_', ' ')}
                </Typography>
              </Box>
            ) : (
              <Typography>No readings available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Medications Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 4,
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Medications
            </Typography>
            <List>
              {medications.map(med => (
                <React.Fragment key={med._id}>
                  <ListItem>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {med.name}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography component="div" variant="body2">
                            Type: {med.type.charAt(0).toUpperCase() + med.type.slice(1)}
                          </Typography>
                          {med.schedules && med.schedules.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography component="div" variant="body2" sx={{ fontWeight: 'medium' }}>
                                Schedule:
                              </Typography>
                              <Box component="div" sx={{ pl: 2 }}>
                                {med.schedules.map((schedule, index) => (
                                  <Box key={index} sx={{ my: 1 }}>
                                    <Typography component="div" variant="body2">
                                      {`${schedule.time} - ${schedule.dosage}`}
                                    </Typography>
                                    <Typography component="div" variant="caption" color="textSecondary">
                                      {schedule.daysOfWeek.join(', ')}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                          {med.notes && (
                            <Typography component="div" variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                              Notes: {med.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <IconButton 
                          onClick={() => handleEditMedication(med)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteMedication(med._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            {medications.length === 0 && (
              <Typography>No medications added</Typography>
            )}
          </Paper>
        </Grid>

        {/* Glucose Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 4,
              fontWeight: 'medium',
              color: 'text.primary'
            }}>
              Glucose Level Trends
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    dot={{ fill: '#2196f3', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#2196f3' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Glucose Readings List */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 3,
              fontWeight: 'medium',
              color: 'text.primary'
            }}>
              All Glucose Readings
            </Typography>
            <List>
              {glucoseReadings
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(reading => (
                  <React.Fragment key={reading._id}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.08)'
                        }
                      }}
                    >
                     <ListItemText
                        primary={reading.level + " mg/dL"}
                        secondary={
                          <>
                            <span style={{ display: 'block' }}>
                              {new Date(reading.timestamp).toLocaleString()}
                            </span>
                            <span style={{ display: 'block' }}>
                              Status: {reading.mealStatus.replace('_', ' ')}
                            </span>
                            {reading.notes && (
                              <span style={{ display: 'block' }}>
                                Notes: {reading.notes}
                              </span>
                            )}
                          </>
                        }
                      />
                      <Box>
                        <IconButton 
                          onClick={() => handleEditReading(reading)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteReading(reading._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
<AddGlucoseReading
  open={openGlucoseForm}
  handleClose={() => setOpenGlucoseForm(false)}
  onReadingAdded={handleAddReading}
/>

<AddMedication
  open={openMedicationForm}
  handleClose={() => setOpenMedicationForm(false)}
  onMedicationAdded={handleAddMedication}
/>

<EditGlucoseReading
  open={openEditForm}
  handleClose={() => {
    setOpenEditForm(false);
    setSelectedReading(null);
  }}
  reading={selectedReading}
  onReadingUpdated={handleUpdateReading}
/>

<EditMedication
  open={openEditMedicationForm}
  handleClose={() => {
    setOpenEditMedicationForm(false);
    setSelectedMedication(null);
  }}
  medication={selectedMedication}
  onMedicationUpdated={handleUpdateMedication}
/>

<AlertSettings
  open={openAlertSettings}
  handleClose={() => setOpenAlertSettings(false)}
  onSettingsSaved={() => {
    setOpenAlertSettings(false);
  }}
/>
    </Container>
  );
};

export default Dashboard;
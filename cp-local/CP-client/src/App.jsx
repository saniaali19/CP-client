import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard';
import { StyledEngineProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import EmergencyDashboard from './components/EmergencyContactDashboard';
import PropTypes from 'prop-types';

 const PrivateRoute = ({ children, allowedUserType }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to={userType === 'emergency_contact' ? '/emergency-dashboard' : '/dashboard'} />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedUserType: PropTypes.string.isRequired
};

function App() {
  
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', 
      light: '#64b5f6',
      dark: '#1976d2'
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }
    }
  }
});


  return (
     <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
      <CssBaseline />
       <Box 
          component="main"
          sx={{
            height: '100vh',
            position: 'relative',              
            zIndex: 1            
          }}
        >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
         <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute allowedUserType="patient">
                    <Box role="main" tabIndex={-1}>
                      <Dashboard />
                    </Box>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/emergency-dashboard" 
                element={
                  <PrivateRoute allowedUserType="emergency_contact">
                    <Box role="main" tabIndex={-1}>
                      <EmergencyDashboard />
                    </Box>
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Router>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;

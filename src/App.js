import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreatePollPage from './pages/CreatePollPage';
import PollPage from './pages/PollPage';
import PollResultsPage from './pages/PollResultsPage';

// Socket
import { initializeSocket, disconnectSocket } from './services/socketService';

// Create a theme with improved contrast and colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#2962ff', // Vibrant blue
      dark: '#0039cb',
      light: '#768fff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff3d00', // Vibrant orange
      dark: '#c30000',
      light: '#ff7539',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a', 
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
          padding: '8px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0039cb',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#c30000',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  // Initialize socket connection
  useEffect(() => {
    initializeSocket();

    // Cleanup socket connection when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/create-poll" 
              element={
                <ProtectedRoute>
                  <CreatePollPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Poll routes */}
            <Route path="/poll/:id" element={<PollPage />} />
            <Route path="/poll/:id/results" element={<PollResultsPage />} />
            
            {/* Fallback route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

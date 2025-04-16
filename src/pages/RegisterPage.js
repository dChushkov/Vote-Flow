import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
  const { register: registerUser, error: authError, loading } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      setError(null);
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        sx={{
          my: { xs: 3, md: 6 },
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              p: 1,
              mb: 1,
            }}
          >
            <PersonAddIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Create an Account
          </Typography>
          <Box sx={{ mt: 3 }}>
            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || authError}
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    label="Full Name"
                    autoComplete="name"
                    {...register('name', {
                      required: 'Name is required',
                      maxLength: {
                        value: 50,
                        message: 'Name cannot be more than 50 characters',
                      },
                    })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email Address"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Please enter a valid email',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'The passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Sign Up'}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Already have an account? Log in
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </form>
          </Box>
          <Divider sx={{ my: 2, width: '100%' }} />
          <Button 
            component={Link} 
            to="/"
            variant="outlined" 
            sx={{ mt: 1 }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 
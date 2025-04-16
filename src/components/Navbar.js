import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AuthContext from '../context/AuthContext';
import { Avatar, Container, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMobileMenuClose();
  };

  // Handle mobile menu open/close
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  // Check if current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Style for active button
  const activeButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    fontWeight: 'bold',
    borderRadius: '8px',
  };

  return (
    <AppBar 
      position="static" 
      elevation={2}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        background: 'linear-gradient(90deg, #1a237e 0%, #283593 100%)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.15)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HowToVoteIcon 
              sx={{ 
                fontSize: { xs: 24, md: 32 }, 
                mr: 1,
                filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))'
              }} 
            />
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                letterSpacing: '0.5px',
                background: 'linear-gradient(45deg, #ffffff 30%, #e0e0e0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                fontSize: { xs: '1.2rem', md: '1.6rem' }
              }}
            >
              VoteFlow
            </Typography>
          </Box>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/"
                    sx={{
                      mx: 0.5,
                      ...(isActive('/') ? activeButtonStyle : {})
                    }}
                  >
                    Home
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/dashboard"
                    sx={{
                      mx: 0.5,
                      ...(isActive('/dashboard') ? activeButtonStyle : {})
                    }}
                  >
                    My Polls
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/create-poll"
                    sx={{
                      mx: 0.5,
                      ...(isActive('/create-poll') ? activeButtonStyle : {})
                    }}
                  >
                    Create Poll
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    sx={{ mx: 0.5 }}
                  >
                    Logout
                  </Button>
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 38, 
                        height: 38, 
                        bgcolor: 'secondary.main',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Typography 
                      sx={{ 
                        ml: 1, 
                        fontWeight: 500
                      }}
                    >
                      {user?.name}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/"
                    sx={{
                      mx: 0.5,
                      ...(isActive('/') ? activeButtonStyle : {})
                    }}
                  >
                    Home
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                    variant="outlined"
                    sx={{
                      mx: 0.5,
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      ...(isActive('/login') ? activeButtonStyle : {})
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="secondary"
                    variant="contained"
                    component={Link} 
                    to="/register"
                    sx={{
                      mx: 0.5,
                      ...(isActive('/register') ? { fontWeight: 'bold' } : {})
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated && (
                <Box sx={{ mr: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'secondary.main',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                </Box>
              )}
              <IconButton
                size="small"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            {isAuthenticated ? (
              [
                user?.name && (
                  <MenuItem key="username" disabled sx={{ opacity: 0.7, fontWeight: 'bold' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                    {user.name}
                  </MenuItem>
                ),
                <MenuItem 
                  key="home"
                  component={Link} 
                  to="/" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/')}
                >
                  Home
                </MenuItem>,
                <MenuItem 
                  key="dashboard"
                  component={Link} 
                  to="/dashboard" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/dashboard')}
                >
                  My Polls
                </MenuItem>,
                <MenuItem 
                  key="create-poll"
                  component={Link} 
                  to="/create-poll" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/create-poll')}
                >
                  Create Poll
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Logout
                </MenuItem>
              ]
            ) : (
              [
                <MenuItem 
                  key="home"
                  component={Link} 
                  to="/" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/')}
                >
                  Home
                </MenuItem>,
                <MenuItem 
                  key="login"
                  component={Link} 
                  to="/login" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/login')}
                >
                  Login
                </MenuItem>,
                <MenuItem 
                  key="register"
                  component={Link} 
                  to="/register" 
                  onClick={handleMobileMenuClose}
                  selected={isActive('/register')}
                >
                  Register
                </MenuItem>
              ]
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
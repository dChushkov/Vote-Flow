import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pollService } from '../services/api';
import AuthContext from '../context/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Pagination,
  Stack,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PollIcon from '@mui/icons-material/Poll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const response = await pollService.getPolls(page);
        setPolls(response.data);
        setTotalPages(response.pagination.pages);
      } catch (err) {
        setError('Failed to load polls. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreatePoll = () => {
    if (isAuthenticated) {
      navigate('/create-poll');
    } else {
      navigate('/register');
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Hero Section with animated gradient background */}
      <Box 
        sx={{
          background: 'linear-gradient(-45deg, #2962FF, #3D5AFE, #651FFF, #D500F9)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backgroundSize: 'cover',
            opacity: 0.2,
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800,
                    mb: 2,
                    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    lineHeight: { xs: 1.2, md: 1.4 }
                  }}
                >
                  Create Polls That <br />
                  <Box 
                    component="span" 
                    sx={{ 
                      color: theme.palette.secondary.light,
                      borderBottom: '4px solid',
                      borderColor: 'secondary.light',
                      pb: 0.5,
                    }}
                  >
                    Get Results
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    fontWeight: 400,
                    opacity: 0.9,
                    maxWidth: 500,
                    lineHeight: 1.5,
                    fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Create beautiful polls, share them instantly, and get real-time insights from your audience.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    onClick={handleCreatePoll}
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: '0px 4px 12px rgba(255, 61, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: theme.palette.secondary.dark,
                      }
                    }}
                  >
                    {isAuthenticated ? "Create Your Poll" : "Get Started Free"}
                  </Button>
                  
                  {!isAuthenticated && (
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      color="inherit"
                      size="large"
                      sx={{ 
                        py: 1.5, 
                        px: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      Log In
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>
            
            <Grid item size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  perspective: '1000px',
                }}
              >
                <Box 
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 450,
                    height: 450,
                    transform: 'rotateY(-10deg) rotateX(5deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Floating poll cards */}
                  <Paper
                    elevation={20}
                    sx={{
                      position: 'absolute',
                      top: '10%',
                      left: '15%',
                      width: '70%',
                      borderRadius: 4,
                      p: 2,
                      bgcolor: 'background.paper',
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                      transform: 'translateZ(80px)',
                      animation: 'float1 6s ease-in-out infinite',
                      '@keyframes float1': {
                        '0%, 100%': { transform: 'translateZ(80px) translateY(0px)' },
                        '50%': { transform: 'translateZ(80px) translateY(-20px)' },
                      }
                    }}
                  >
                    <Typography variant="h6" color="primary.main" gutterBottom>Which feature do you like most?</Typography>
                    <Stack spacing={1}>
                      <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>Real-time results</Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>Multiple choice options</Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>User-friendly interface</Box>
                    </Stack>
                  </Paper>
                  
                  <Paper
                    elevation={16}
                    sx={{
                      position: 'absolute',
                      top: '45%',
                      right: '10%',
                      width: '65%',
                      borderRadius: 4,
                      p: 2,
                      bgcolor: 'background.paper',
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                      transform: 'translateZ(40px) rotate(5deg)',
                      animation: 'float2 7s ease-in-out infinite',
                      '@keyframes float2': {
                        '0%, 100%': { transform: 'translateZ(40px) rotate(5deg) translateY(0px)' },
                        '50%': { transform: 'translateZ(40px) rotate(5deg) translateY(-15px)' },
                      }
                    }}
                  >
                    <Typography variant="h6" color="secondary.main" gutterBottom>How was your experience?</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                      <Chip label="Great!" color="success" />
                      <Chip label="Good" variant="outlined" />
                      <Chip label="Average" variant="outlined" />
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Stats Row */}
          <Box 
            sx={{ 
              mt: { xs: 4, md: 10 },
              mb: { xs: 2, md: 0 },
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              backdropFilter: 'blur(10px)',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }
                  }}>5K+</Typography>
                  <Typography variant="subtitle1" 
                    sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                  >Active Users</Typography>
                </Box>
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }
                  }}>10K+</Typography>
                  <Typography variant="subtitle1" 
                    sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                  >Polls Created</Typography>
                </Box>
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }
                  }}>1M+</Typography>
                  <Typography variant="subtitle1" 
                    sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                  >Votes Collected</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      
      {/* Recent Polls Section */}
      <Box 
        sx={{ 
          py: 8,
          background: 'linear-gradient(180deg, rgba(245,247,255,1) 0%, rgba(237,242,255,1) 100%)',
          borderTop: '1px solid rgba(63, 81, 181, 0.08)',
          borderBottom: '1px solid rgba(63, 81, 181, 0.08)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%233f51b5' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            opacity: 0.6,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                position: 'relative',
                display: 'inline-block',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'secondary.main',
                  borderRadius: 2,
                }
              }}
            >
              Recent Polls
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                mt: 2,
                fontWeight: 400,
              }}
            >
              Discover the latest polls from our community or create your own
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Grid container spacing={3}>
                {polls.length > 0 ? (
                  polls.map((poll) => (
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={poll._id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #651FFF, #B39DDB)',
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography
                            gutterBottom
                            variant="h6"
                            component="h3"
                            noWrap
                            sx={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              fontWeight: 600,
                              color: 'primary.dark',
                            }}
                          >
                            {poll.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              height: '40px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {poll.description || 'No description provided.'}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Chip
                              icon={<PollIcon />}
                              label={`${poll.totalVotes} votes`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: '16px' }}
                            />
                            {poll.settings.endDate && (
                              <Chip
                                icon={<AccessTimeIcon />}
                                label={`Ends: ${formatDate(poll.settings.endDate)}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ borderRadius: '16px' }}
                              />
                            )}
                          </Stack>
                          <Chip
                            label={poll.questionType === 'single' ? 'Single Choice' : poll.questionType === 'multiple' ? 'Multiple Choice' : 'Text Response'}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(0, 0, 0, 0.05)',
                              borderRadius: '16px',
                              fontWeight: 500
                            }}
                          />
                        </CardContent>
                        <CardActions sx={{ 
                          p: 2, 
                          pt: 0, 
                          justifyContent: 'space-between',
                          bgcolor: 'rgba(0, 0, 0, 0.02)'
                        }}>
                          <Button
                            size="small"
                            component={Link}
                            to={`/poll/${poll._id}`}
                            color="primary"
                            startIcon={<HowToVoteIcon />}
                            sx={{ fontWeight: 500 }}
                          >
                            Vote Now
                          </Button>
                          <Button
                            size="small"
                            component={Link}
                            to={`/poll/${poll._id}/results`}
                            color="secondary"
                            startIcon={<PollIcon />}
                            sx={{ fontWeight: 500 }}
                          >
                            View Results
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ 
                      p: 5, 
                      textAlign: 'center',
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: '1px dashed rgba(0, 0, 0, 0.15)'
                    }}>
                      <Typography 
                        align="center" 
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        No polls available at the moment.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/create-poll"
                        startIcon={<PollIcon />}
                        sx={{ mt: 1 }}
                      >
                        Create the first poll
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                      },
                      '& .Mui-selected': {
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: 8,
        background: 'linear-gradient(180deg, rgba(236,242,255,1) 0%, rgba(225,235,255,1) 100%)',
        borderTop: '1px solid rgba(25, 118, 210, 0.08)',
        borderBottom: '1px solid rgba(25, 118, 210, 0.08)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976d2' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          opacity: 0.6,
          zIndex: 0
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                position: 'relative',
                display: 'inline-block',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                }
              }}
            >
              Powerful Features
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                mt: 2,
                fontWeight: 400,
              }}
            >
              Everything you need for effective polling
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderTop: '4px solid',
                borderColor: 'primary.main',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <GroupIcon fontSize="large" />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Easy Poll Creation
                  </Typography>
                  <Typography variant="body1">
                    Create polls with different question types including single choice,
                    multiple choice and free text responses in minutes.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderTop: '4px solid',
                borderColor: 'secondary.main',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    bgcolor: 'secondary.light', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <SpeedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Real-time Results
                  </Typography>
                  <Typography variant="body1">
                    See results update in real-time as votes come in. View detailed
                    statistics and visualizations instantly.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderTop: '4px solid',
                borderColor: 'primary.main',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <VerifiedUserIcon fontSize="large" />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Customizable Settings
                  </Typography>
                  <Typography variant="body1">
                    Control who can vote, whether to allow multiple votes, set end dates,
                    and configure many other options to suit your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call-to-action Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            opacity: 0.2,
          }
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to start collecting votes?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Join thousands of users who are already making better decisions with VoteFlow
            </Typography>
            <Button
              onClick={handleCreatePoll}
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 1.5, 
                px: 4,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0px 4px 12px rgba(255, 61, 0, 0.3)',
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                }
              }}
            >
              {isAuthenticated ? "Create New Poll" : "Get Started for Free"}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage; 
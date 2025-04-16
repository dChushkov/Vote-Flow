import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Divider, 
  Alert, 
  CircularProgress, 
  Stack, 
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Grid 
} from '@mui/material';
import { pollService, voteService } from '../services/api';
import AuthContext from '../context/AuthContext';
import { joinPollRoom, leavePollRoom, subscribeToVoteUpdates } from '../services/socketService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';

const PollResultsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle sharing the poll
  const handleShare = () => {
    const url = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  // Check if poll is expired
  const isPollExpired = () => {
    if (!poll) return false;
    if (!poll.isActive) return true;
    if (poll.settings?.endDate) {
      return new Date(poll.settings.endDate) < new Date();
    }
    return false;
  };

  // Load poll data and stats
  useEffect(() => {
    const fetchPollAndStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch poll data
        const pollResponse = await pollService.getPoll(id);
        setPoll(pollResponse.data);
        
        // Fetch poll stats
        const statsResponse = await voteService.getPollStats(id);
        setStats(statsResponse);
        
      } catch (err) {
        if (err.message === 'Results are hidden for this poll') {
          setError('The poll creator has hidden the results.');
        } else {
          setError(err.message || 'Failed to load poll results');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPollAndStats();
    
    // Join socket room for real-time updates
    joinPollRoom(id);
    
    // Subscribe to vote updates
    subscribeToVoteUpdates(id, handleVoteUpdate);
    
    // Cleanup
    return () => {
      leavePollRoom(id);
    };
  }, [id]);

  // Handle real-time vote updates
  const handleVoteUpdate = async (data) => {
    try {
      // Refresh poll data and stats to get updated vote counts
      const [pollResponse, statsResponse] = await Promise.all([
        pollService.getPoll(id),
        voteService.getPollStats(id)
      ]);
      
      setPoll(pollResponse.data);
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to update poll data:', err);
    }
  };

  // Get different color for each bar
  const getColorForIndex = (index) => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
    return colors[index % colors.length];
  };

  // Format percentage value
  const formatPercentage = (value) => {
    return `${value}%`;
  };

  // Get text color based on value
  const getTextColorForPercentage = (value) => {
    if (value >= 70) return 'success.main';
    if (value >= 30) return 'primary.main';
    return 'text.secondary';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            component={Link} 
            to={`/poll/${id}`}
            startIcon={<ArrowBackIcon />}
          >
            Back to Poll
          </Button>
        </Box>
      </Container>
    );
  }

  if (!poll || !stats) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Poll results not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
        {/* Results Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Poll Results
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            {poll.title}
          </Typography>
          
          {poll.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {poll.description}
            </Typography>
          )}
          
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {poll.settings.endDate && (
              <Chip 
                icon={<AccessTimeIcon />} 
                label={isPollExpired() 
                  ? `Ended: ${formatDate(poll.settings.endDate)}` 
                  : `Ends: ${formatDate(poll.settings.endDate)}`} 
                color="primary" 
                variant="outlined"
              />
            )}
            
            <Chip 
              icon={<HowToVoteIcon />} 
              label={`${poll.totalVotes} votes`} 
              color="primary" 
            />
          </Stack>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Results Content */}
        {shareSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Poll link copied to clipboard!
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          
          {stats.pollType === 'text' ? (
            // Text responses display
            <Box sx={{ mt: 2 }}>
              {stats.data.length === 0 ? (
                <Typography variant="body1">
                  No responses yet.
                </Typography>
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {stats.data.map((response, index) => (
                    <ListItem key={index} divider sx={{ py: 2 }}>
                      <ListItemText 
                        primary={response.textResponse} 
                        secondary={new Date(response.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ) : (
            // Single/multiple choice display
            <Box sx={{ mt: 2 }}>
              {stats.data.length === 0 ? (
                <Typography variant="body1">
                  No votes yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {stats.data.map((option, index) => (
                    <Grid item xs={12} key={option.optionId}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">{option.text}</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={option.percentage} 
                          color={getColorForIndex(index)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: getTextColorForPercentage(option.percentage),
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}
                          >
                            {option.voteCount} votes ({formatPercentage(option.percentage)})
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            component={Link}
            to={`/poll/${id}`}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Poll
          </Button>
          
          <Button
            onClick={handleShare}
            startIcon={<ShareIcon />}
            variant="contained"
            color="primary"
          >
            Share Poll
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PollResultsPage; 
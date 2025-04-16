import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Checkbox, 
  TextField, 
  Divider, 
  Alert, 
  CircularProgress, 
  Stack, 
  Chip 
} from '@mui/material';
import { pollService, voteService } from '../services/api';
import AuthContext from '../context/AuthContext';
import { joinPollRoom, leavePollRoom, subscribeToVoteUpdates } from '../services/socketService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import LockIcon from '@mui/icons-material/Lock';

const PollPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // For voting
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textResponse, setTextResponse] = useState('');
  const [userVoted, setUserVoted] = useState(false);
  const [canVoteAgain, setCanVoteAgain] = useState(false);
  const [previousVote, setPreviousVote] = useState(null);
  
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

  // Check if poll is expired
  const isPollExpired = () => {
    if (!poll) return false;
    if (!poll.isActive) return true;
    if (poll.settings?.endDate) {
      return new Date(poll.settings.endDate) < new Date();
    }
    return false;
  };

  // Check if user can vote
  const canVote = () => {
    if (!poll) return false;
    if (isPollExpired()) return false;
    if (poll.settings?.requireLogin && !user) return false;
    if (userVoted && !canVoteAgain) return false;
    return true;
  };

  // Load poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await pollService.getPoll(id);
        setPoll(response.data);
        
        // Check if user has already voted
        if (poll?.settings?.requireLogin && !user) {
          // Skip vote check if login required but user not logged in
        } else {
          const voteCheckResponse = await voteService.checkUserVoted(id);
          setUserVoted(voteCheckResponse.hasVoted);
          setCanVoteAgain(voteCheckResponse.canVoteAgain);
          setPreviousVote(voteCheckResponse.vote);
          
          // Pre-select previous options if user voted before
          if (voteCheckResponse.hasVoted && voteCheckResponse.vote) {
            if (voteCheckResponse.vote.selectedOptions) {
              setSelectedOptions(voteCheckResponse.vote.selectedOptions);
            }
            if (voteCheckResponse.vote.textResponse) {
              setTextResponse(voteCheckResponse.vote.textResponse);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load poll data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
    
    // Join socket room for real-time updates
    joinPollRoom(id);
    
    // Subscribe to vote updates
    subscribeToVoteUpdates(id, handleVoteUpdate);
    
    // Cleanup
    return () => {
      leavePollRoom(id);
    };
  }, [id, user]);

  // Handle real-time vote updates
  const handleVoteUpdate = async (data) => {
    try {
      // Refresh poll data to get updated vote counts
      const response = await pollService.getPoll(id);
      setPoll(response.data);
    } catch (err) {
      console.error('Failed to update poll data:', err);
    }
  };

  // Handle radio selection for single choice polls
  const handleSingleOptionChange = (e) => {
    setSelectedOptions([e.target.value]);
  };

  // Handle checkbox selection for multiple choice polls
  const handleMultipleOptionChange = (e) => {
    const value = e.target.value;
    
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter(option => option !== value));
    } else {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  // Handle text response input
  const handleTextResponseChange = (e) => {
    setTextResponse(e.target.value);
  };

  // Submit vote
  const handleSubmitVote = async () => {
    try {
      setVotingLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate input
      if (poll.questionType === 'text' && !textResponse.trim()) {
        setError('Please enter a response');
        return;
      }
      
      if (poll.questionType !== 'text' && selectedOptions.length === 0) {
        setError(poll.questionType === 'single' 
          ? 'Please select an option' 
          : 'Please select at least one option');
        return;
      }
      
      const voteData = {
        pollId: poll._id,
        selectedOptions: poll.questionType !== 'text' ? selectedOptions : [],
        textResponse: poll.questionType === 'text' ? textResponse : '',
      };
      
      await voteService.submitVote(voteData);
      
      // Update local state
      setUserVoted(true);
      setCanVoteAgain(poll.settings.allowMultipleVotes);
      setSuccess('Your vote has been recorded!');
      
      // Refresh poll data
      const response = await pollService.getPoll(id);
      setPoll(response.data);
      
    } catch (err) {
      setError(err.message || 'Failed to submit vote. Please try again.');
      console.error(err);
    } finally {
      setVotingLoading(false);
    }
  };

  // Navigate to results page
  const viewResults = () => {
    navigate(`/poll/${id}/results`);
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
      </Container>
    );
  }

  if (!poll) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Poll not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
        {/* Poll Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {poll.title}
          </Typography>
          
          {poll.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {poll.description}
            </Typography>
          )}
          
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {poll.settings.requireLogin && (
              <Chip 
                icon={<LockIcon />} 
                label="Login Required" 
                color="secondary" 
              />
            )}
            
            {poll.settings.endDate && (
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`Ends: ${formatDate(poll.settings.endDate)}`} 
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
        
        {/* Voting Form */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isPollExpired() && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This poll has ended and is no longer accepting votes.
          </Alert>
        )}
        
        {poll.settings.requireLogin && !user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You need to login to vote on this poll.
          </Alert>
        )}
        
        {userVoted && !canVoteAgain && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have already voted on this poll.
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          {poll.questionType === 'single' && (
            <FormControl component="fieldset" fullWidth disabled={!canVote()}>
              <FormLabel component="legend">Select one option:</FormLabel>
              <RadioGroup 
                value={selectedOptions[0] || ''}
                onChange={handleSingleOptionChange}
              >
                {poll.options.map((option) => (
                  <FormControlLabel
                    key={option._id}
                    value={option._id}
                    control={<Radio />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
          
          {poll.questionType === 'multiple' && (
            <FormControl component="fieldset" fullWidth disabled={!canVote()}>
              <FormLabel component="legend">Select one or more options:</FormLabel>
              {poll.options.map((option) => (
                <FormControlLabel
                  key={option._id}
                  control={
                    <Checkbox 
                      checked={selectedOptions.includes(option._id)}
                      onChange={handleMultipleOptionChange}
                      value={option._id}
                    />
                  }
                  label={option.text}
                />
              ))}
            </FormControl>
          )}
          
          {poll.questionType === 'text' && (
            <FormControl fullWidth disabled={!canVote()}>
              <FormLabel>Your response:</FormLabel>
              <TextField
                multiline
                rows={4}
                value={textResponse}
                onChange={handleTextResponseChange}
                placeholder="Type your answer here..."
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              />
            </FormControl>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined"
            onClick={viewResults}
          >
            View Results
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            disabled={!canVote() || votingLoading}
            onClick={handleSubmitVote}
          >
            {votingLoading ? 'Submitting...' : 'Submit Vote'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PollPage; 
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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
  Divider,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import PollIcon from '@mui/icons-material/Poll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [pollToShare, setPollToShare] = useState(null);

  useEffect(() => {
    fetchUserPolls();
  }, []);

  const fetchUserPolls = async () => {
    try {
      setLoading(true);
      const response = await pollService.getUserPolls();
      setPolls(response.data);
    } catch (err) {
      setError('Failed to load your polls. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (poll) => {
    setPollToDelete(poll);
    setDeleteDialogOpen(true);
  };

  const handleShareClick = (poll) => {
    setPollToShare(poll);
    setShareDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await pollService.deletePoll(pollToDelete._id);
      setPolls(polls.filter(poll => poll._id !== pollToDelete._id));
      setDeleteDialogOpen(false);
      setPollToDelete(null);
    } catch (err) {
      setError('Failed to delete poll. Please try again later.');
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPollToDelete(null);
  };

  const handleShareClose = () => {
    setShareDialogOpen(false);
    setPollToShare(null);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/poll/${pollToShare._id}`;
    navigator.clipboard.writeText(shareUrl);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Polls
        </Typography>
        <Button
          component={Link}
          to="/create-poll"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Poll
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {polls.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <Typography variant="h6" gutterBottom>
                You haven't created any polls yet.
              </Typography>
              <Button
                component={Link}
                to="/create-poll"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                startIcon={<AddIcon />}
              >
                Create Your First Poll
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {polls.map((poll) => (
                <Grid item xs={12} sm={6} md={4} key={poll._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        noWrap
                        sx={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
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
                        />
                        {poll.settings?.endDate && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={`Ends: ${formatDate(poll.settings.endDate)}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={
                            poll.questionType === 'single'
                              ? 'Single Choice'
                              : poll.questionType === 'multiple'
                              ? 'Multiple Choice'
                              : 'Text Response'
                          }
                          size="small"
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                          label={poll.isActive ? 'Active' : 'Inactive'}
                          color={poll.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton
                          component={Link}
                          to={`/edit-poll/${poll._id}`}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleShareClick(poll)}
                          color="primary"
                          size="small"
                        >
                          <ShareIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(poll)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        <Button
                          size="small"
                          component={Link}
                          to={`/poll/${poll._id}/results`}
                          color="primary"
                        >
                          Results
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Poll</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the poll "{pollToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={handleShareClose}
      >
        <DialogTitle>Share Poll</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this link with others to let them vote:
          </DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              wordBreak: 'break-all',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {pollToShare && `${window.location.origin}/poll/${pollToShare._id}`}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareClose}>Close</Button>
          <Button onClick={copyShareLink} color="primary">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage; 
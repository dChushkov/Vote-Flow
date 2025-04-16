import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Switch, 
  Grid, 
  IconButton, 
  Divider, 
  Alert, 
  Stack,
  MenuItem,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { pollService } from '../services/api';
import AuthContext from '../context/AuthContext';

const CreatePollPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionType, setQuestionType] = useState('single');
  
  const { 
    control, 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      questionType: 'single',
      options: [{ text: '' }, { text: '' }],
      settings: {
        requireLogin: false,
        allowMultipleVotes: false,
        endDate: null,
        showResults: true
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const watchQuestionType = watch('questionType');

  // Update local state when form value changes
  const onQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Text response polls don't need options
      if (data.questionType === 'text') {
        data.options = [];
      }
      
      // Clean up endDate if not set
      if (data.settings.endDate === null || data.settings.endDate === '') {
        data.settings.endDate = null;
      }
      
      const response = await pollService.createPoll(data);
      
      navigate(`/poll/${response.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create poll. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mb: 4 }}>
      <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }} elevation={3}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create a New Poll
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Poll Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Poll Title"
                variant="outlined"
                {...register('title', { 
                  required: 'Title is required',
                  maxLength: {
                    value: 200,
                    message: 'Title cannot exceed 200 characters'
                  } 
                })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>
            
            {/* Poll Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                variant="outlined"
                multiline
                rows={3}
                {...register('description', { 
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters'
                  } 
                })}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
            
            {/* Question Type */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Question Type</FormLabel>
                <Controller
                  name="questionType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup 
                      row 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        onQuestionTypeChange(e);
                      }}
                    >
                      <FormControlLabel 
                        value="single" 
                        control={<Radio />} 
                        label="Single Choice" 
                      />
                      <FormControlLabel 
                        value="multiple" 
                        control={<Radio />} 
                        label="Multiple Choice" 
                      />
                      <FormControlLabel 
                        value="text" 
                        control={<Radio />} 
                        label="Text Response" 
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>
            
            {/* Options (for single/multiple choice) */}
            {watchQuestionType !== 'text' && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Poll Options
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Add options for people to choose from.
                  </Typography>
                </Box>
                
                {fields.map((field, index) => (
                  <Box 
                    key={field.id} 
                    sx={{ 
                      display: 'flex', 
                      mb: 2,
                      alignItems: 'center' 
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      variant="outlined"
                      {...register(`options.${index}.text`, {
                        required: 'Option text is required'
                      })}
                      error={!!errors.options?.[index]?.text}
                      helperText={errors.options?.[index]?.text?.message}
                    />
                    <IconButton 
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                      color="error"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => append({ text: '' })}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </Grid>
            )}
            
            {/* Poll Settings */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Poll Settings
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {/* Require Login */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="settings.requireLogin"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            checked={value}
                            onChange={onChange}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Require Login to Vote"
                  />
                  <Typography variant="body2" color="text.secondary">
                    If enabled, users must be logged in to vote
                  </Typography>
                </Grid>
                
                {/* Allow Multiple Votes */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="settings.allowMultipleVotes"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            checked={value}
                            onChange={onChange}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Allow Multiple Votes"
                  />
                  <Typography variant="body2" color="text.secondary">
                    If enabled, users can vote more than once
                  </Typography>
                </Grid>
                
                {/* End Date */}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name="settings.endDate"
                      control={control}
                      render={({ field }) => (
                        <DateTimePicker
                          label="End Date (Optional)"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          textField={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              error={!!errors.settings?.endDate}
                              helperText={errors.settings?.endDate?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <Typography variant="body2" color="text.secondary">
                    If set, voting will end at this date and time
                  </Typography>
                </Grid>
                
                {/* Show Results */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="settings.showResults"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            checked={value}
                            onChange={onChange}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Show Results to Voters"
                  />
                  <Typography variant="body2" color="text.secondary">
                    If disabled, only you can see the results
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Poll'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePollPage; 
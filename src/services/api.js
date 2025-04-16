import axios from 'axios';

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Poll API Service
export const pollService = {
  // Get all polls with optional pagination
  getPolls: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/polls?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific poll by ID
  getPoll: async (id) => {
    try {
      const response = await api.get(`/polls/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a poll by shareable link
  getPollByLink: async (link) => {
    try {
      const response = await api.get(`/polls/share/${link}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new poll (requires authentication)
  createPoll: async (pollData) => {
    try {
      const response = await api.post('/polls', pollData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update an existing poll (requires authentication)
  updatePoll: async (id, pollData) => {
    try {
      const response = await api.put(`/polls/${id}`, pollData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a poll (requires authentication)
  deletePoll: async (id) => {
    try {
      const response = await api.delete(`/polls/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get polls created by the logged-in user (requires authentication)
  getUserPolls: async () => {
    try {
      const response = await api.get('/polls/user/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Vote API Service
export const voteService = {
  // Submit a vote
  submitVote: async (voteData) => {
    try {
      const response = await api.post('/votes', voteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get votes for a specific poll
  getPollVotes: async (pollId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/votes/poll/${pollId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get vote statistics for a poll
  getPollStats: async (pollId) => {
    try {
      const response = await api.get(`/votes/stats/${pollId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if the current user has voted on a poll
  checkUserVoted: async (pollId) => {
    try {
      const response = await api.get(`/votes/check/${pollId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api; 
import { io } from 'socket.io-client';

let socket;

export const initializeSocket = () => {
  socket = io('http://localhost:5000', {
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const joinPollRoom = (pollId) => {
  if (socket) {
    socket.emit('join_poll', pollId);
    console.log(`Joined poll room: ${pollId}`);
  }
};

export const leavePollRoom = (pollId) => {
  if (socket) {
    socket.emit('leave_poll', pollId);
    console.log(`Left poll room: ${pollId}`);
  }
};

export const subscribeToVoteUpdates = (pollId, callback) => {
  if (socket) {
    // First unsubscribe to avoid duplicate listeners
    socket.off('vote_update');
    
    // Add new listener
    socket.on('vote_update', (data) => {
      if (data.pollId === pollId) {
        callback(data);
      }
    });
  }
};

export const unsubscribeFromVoteUpdates = () => {
  if (socket) {
    socket.off('vote_update');
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export default {
  initializeSocket,
  joinPollRoom,
  leavePollRoom,
  subscribeToVoteUpdates,
  unsubscribeFromVoteUpdates,
  disconnectSocket,
  getSocket,
}; 
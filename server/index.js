// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
const voteRoutes = require("./routes/voteRoutes");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Socket.io setup
io.on("connection", (socket) => {
  console.log("New client connected");
  
  // Join a poll room to get updates
  socket.on("join_poll", (pollId) => {
    socket.join(pollId);
    console.log(`User joined poll room: ${pollId}`);
  });
  
  // Leave a poll room
  socket.on("leave_poll", (pollId) => {
    socket.leave(pollId);
    console.log(`User left poll room: ${pollId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Event to emit when a new vote is submitted
// This can be called from the vote controller
const emitVoteUpdate = (pollId) => {
  io.to(pollId).emit("vote_update", { pollId });
};

// Make socket.io available to other files
app.set("io", io);
app.set("emitVoteUpdate", emitVoteUpdate);

// Routes
app.get("/", (req, res) => {
  res.send("VoteFlow API is running 🎉");
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to database
connectDB();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
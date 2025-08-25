/**
 * Main application entry point
 * Initializes and starts the chat server
 */

const ChatServer = require('./src/server');
const connectDB = require('./src/config/connections');

// Initialize database connection
connectDB();

// Create and start the server
const chatServer = new ChatServer();
chatServer.start();
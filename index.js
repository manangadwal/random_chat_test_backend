/**
 * Main application entry point
 * Initializes and starts the chat server
 */

const ChatServer = require('./src/server');

// Create and start the server
const chatServer = new ChatServer();
chatServer.start();
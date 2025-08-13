/**
 * Main server entry point
 * Sets up Express server and Socket.IO with CORS configuration
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SocketHandler = require('./handlers/socketHandler');
const { users, activeChats, waitingUsers, userProfiles } = require('./storage/memoryStorage');

class ChatServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    /**
     * Configure Express middleware
     */
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    /**
     * Setup HTTP routes
     */
    setupRoutes() {
        // Health check endpoint with server statistics
        this.app.get('/', (req, res) => {
            const profilesCompleted = Array.from(userProfiles.values())
                .filter(profile => profile.isProfileComplete).length;

            res.json({
                message: 'Random Chat Server is running',
                activeUsers: users.size,
                activeChats: activeChats.size,
                waitingUsers: waitingUsers.size,
                profilesCompleted: profilesCompleted,
                profilesTotal: userProfiles.size
            });
        });
    }

    /**
     * Initialize Socket.IO event handlers
     */
    setupSocketHandlers() {
        const socketHandler = new SocketHandler(this.io);

        this.io.on('connection', (socket) => {
            socketHandler.handleConnection(socket);
        });
    }

    /**
     * Start the server on specified port
     */
    start(port = process.env.PORT || 3000) {
        this.server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`WebSocket server ready for connections`);
        });
    }
}

module.exports = ChatServer;
/**
 * Main server entry point - MVC Architecture
 * Sets up Express server and Socket.IO with proper MVC structure
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SocketView = require('./views/SocketView');
const HttpView = require('./views/HttpView');

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

        // Initialize views
        this.socketView = new SocketView(this.io);
        this.httpView = new HttpView();

        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupErrorHandling();
    }

    /**
     * Configure Express middleware
     */
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup HTTP routes through HttpView
     */
    setupRoutes() {
        this.httpView.setupRoutes(this.app);

        // Handle 404 errors
        this.app.use('*', (req, res) => {
            this.httpView.handle404(req, res);
        });
    }

    /**
     * Initialize Socket.IO event handlers through SocketView
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.socketView.handleConnection(socket);
        });
    }

    /**
     * Setup error handling middleware
     */
    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            this.httpView.handleError(error, req, res, next);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            // Graceful shutdown could be implemented here
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }

    /**
     * Start the server on specified port
     */
    start(port = process.env.PORT || 3000) {
        this.server.listen(port, () => {
            console.log(`🚀 Chat Server started successfully!`);
            console.log(`📡 Server running on port ${port}`);
            console.log(`🔌 WebSocket server ready for connections`);
            console.log(`🏗️  Architecture: MVC Pattern`);
            console.log(`📊 Health check: http://localhost:${port}/health`);
            console.log(`📈 Statistics: http://localhost:${port}/api/stats`);
            console.log(`⏰ Started at: ${new Date().toISOString()}`);
        });

        // Graceful shutdown handling
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('SIGINT', () => this.gracefulShutdown());
    }

    /**
     * Graceful shutdown
     */
    gracefulShutdown() {
        console.log('\n🛑 Received shutdown signal, starting graceful shutdown...');

        this.server.close(() => {
            console.log('✅ HTTP server closed');

            // Close Socket.IO server
            this.io.close(() => {
                console.log('✅ Socket.IO server closed');
                console.log('👋 Graceful shutdown completed');
                process.exit(0);
            });
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('❌ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    }

    /**
     * Get server instance (for testing)
     */
    getServer() {
        return this.server;
    }

    /**
     * Get Socket.IO instance (for testing)
     */
    getIO() {
        return this.io;
    }
}

module.exports = ChatServer;
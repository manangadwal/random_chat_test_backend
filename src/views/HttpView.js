/**
 * HTTP View
 * Handles HTTP requests and responses (View layer in MVC)
 */

const UserController = require('../controllers/UserController');
const ChatController = require('../controllers/ChatController');
const GroupChatController = require('../controllers/GroupChatController');

class HttpView {
    constructor() {
        this.userController = new UserController();
        this.chatController = new ChatController();
        this.groupChatController = new GroupChatController();
    }

    /**
     * Setup HTTP routes
     * @param {Object} app - Express app instance
     */
    setupRoutes(app) {
        // Health check and server info
        app.get('/', (req, res) => this.getServerInfo(req, res));
        app.get('/health', (req, res) => this.getHealthCheck(req, res));

        // Statistics endpoints
        app.get('/api/stats', (req, res) => this.getStats(req, res));
        app.get('/api/stats/users', (req, res) => this.getUserStats(req, res));
        app.get('/api/stats/chats', (req, res) => this.getChatStats(req, res));
        app.get('/api/stats/groups', (req, res) => this.getGroupStats(req, res));

        // User endpoints
        app.get('/api/users/count', (req, res) => this.getUserCount(req, res));
        app.get('/api/users/active', (req, res) => this.getActiveUsers(req, res));

        // Admin endpoints (for monitoring/debugging)
        app.get('/api/admin/cleanup', (req, res) => this.performCleanup(req, res));
        app.get('/api/admin/system-info', (req, res) => this.getSystemInfo(req, res));
    }

    /**
     * Get server information and statistics
     */
    getServerInfo(req, res) {
        try {
            const userStats = this.userController.getUserStats();
            const chatStats = this.chatController.getChatStats();
            const groupStats = this.groupChatController.getGroupStats();

            res.json({
                message: 'Random Chat Server is running',
                version: '2.0.0',
                architecture: 'MVC',
                timestamp: new Date(),
                users: {
                    total: userStats.total,
                    active: userStats.total,
                    inChat: userStats.usersInChat,
                    inGroup: userStats.usersInGroup,
                    available: userStats.availableUsers,
                    completedProfiles: userStats.completedProfiles
                },
                chats: {
                    active: chatStats.activeChats,
                    completed: chatStats.completedChats,
                    waiting: chatStats.waitingUsers,
                    totalMessages: chatStats.totalMessages
                },
                groups: {
                    total: groupStats.totalGroups,
                    active: groupStats.activeGroups,
                    totalMembers: groupStats.totalMembers,
                    availableSlots: groupStats.availableSlots,
                    maxGroupSize: groupStats.maxGroupSize
                }
            });
        } catch (error) {
            console.error('Error getting server info:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Health check endpoint
     */
    getHealthCheck(req, res) {
        try {
            const userCount = this.userController.getActiveUsersCount();

            res.json({
                status: 'healthy',
                timestamp: new Date(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                activeUsers: userCount,
                version: '2.0.0'
            });
        } catch (error) {
            res.status(500).json({
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date()
            });
        }
    }

    /**
     * Get comprehensive statistics
     */
    getStats(req, res) {
        try {
            const userStats = this.userController.getUserStats();
            const chatStats = this.chatController.getChatStats();
            const groupStats = this.groupChatController.getGroupStats();

            res.json({
                users: userStats,
                chats: chatStats,
                groups: groupStats,
                timestamp: new Date(),
                server: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: '2.0.0',
                    architecture: 'MVC'
                }
            });
        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({
                error: 'Failed to get statistics',
                message: error.message
            });
        }
    }

    /**
     * Get user statistics
     */
    getUserStats(req, res) {
        try {
            const stats = this.userController.getUserStats();
            res.json({
                ...stats,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get user statistics',
                message: error.message
            });
        }
    }

    /**
     * Get chat statistics
     */
    getChatStats(req, res) {
        try {
            const stats = this.chatController.getChatStats();
            res.json({
                ...stats,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get chat statistics',
                message: error.message
            });
        }
    }

    /**
     * Get group statistics
     */
    getGroupStats(req, res) {
        try {
            const stats = this.groupChatController.getGroupStats();
            res.json({
                ...stats,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get group statistics',
                message: error.message
            });
        }
    }

    /**
     * Get user count
     */
    getUserCount(req, res) {
        try {
            const count = this.userController.getActiveUsersCount();
            res.json({
                count,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get user count',
                message: error.message
            });
        }
    }

    /**
     * Get active users information
     */
    getActiveUsers(req, res) {
        try {
            const users = this.userController.getUsersByCriteria({});
            const sanitizedUsers = users.map(user => ({
                id: user.id,
                connectedAt: user.connectedAt,
                isInChat: user.isInChat,
                isInGroup: user.isInGroup,
                profileComplete: user.isProfileComplete()
            }));

            res.json({
                users: sanitizedUsers,
                count: sanitizedUsers.length,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get active users',
                message: error.message
            });
        }
    }

    /**
     * Perform system cleanup (admin endpoint)
     */
    performCleanup(req, res) {
        try {
            const results = {
                chatsCleanedUp: 0,
                groupsCleanedUp: 0,
                timestamp: new Date()
            };

            // Clean up old inactive chats (older than 24 hours)
            results.chatsCleanedUp = this.chatController.cleanupInactiveChats();

            // Clean up empty groups
            results.groupsCleanedUp = this.groupChatController.cleanupEmptyGroups();

            res.json({
                message: 'Cleanup completed successfully',
                results
            });
        } catch (error) {
            console.error('Error during cleanup:', error);
            res.status(500).json({
                error: 'Cleanup failed',
                message: error.message
            });
        }
    }

    /**
     * Get system information (admin endpoint)
     */
    getSystemInfo(req, res) {
        try {
            const memoryUsage = process.memoryUsage();

            res.json({
                system: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    uptime: process.uptime(),
                    pid: process.pid
                },
                memory: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                    external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
                },
                server: {
                    version: '2.0.0',
                    architecture: 'MVC Pattern',
                    features: [
                        'One-on-one chat',
                        'Group chat',
                        'User profiles',
                        'Gender preferences',
                        'Profanity filtering',
                        'Real-time statistics'
                    ]
                },
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get system information',
                message: error.message
            });
        }
    }

    /**
     * Handle 404 errors
     */
    handle404(req, res) {
        res.status(404).json({
            error: 'Endpoint not found',
            message: `The endpoint ${req.method} ${req.path} does not exist`,
            availableEndpoints: [
                'GET /',
                'GET /health',
                'GET /api/stats',
                'GET /api/stats/users',
                'GET /api/stats/chats',
                'GET /api/stats/groups',
                'GET /api/users/count',
                'GET /api/users/active'
            ],
            timestamp: new Date()
        });
    }

    /**
     * Handle server errors
     */
    handleError(error, req, res, next) {
        console.error('HTTP Error:', error);

        res.status(error.status || 500).json({
            error: 'Internal server error',
            message: error.message || 'An unexpected error occurred',
            timestamp: new Date()
        });
    }
}

module.exports = HttpView;
/**
 * Socket View
 * Handles WebSocket communication and event routing (View layer in MVC)
 */

const UserController = require('../controllers/UserController');
const ChatController = require('../controllers/ChatController');
const GroupChatController = require('../controllers/GroupChatController');
const MatchingService = require('../services/matchingService');

class SocketView {
    constructor(io) {
        this.io = io;
        this.userController = new UserController();
        this.chatController = new ChatController(io);
        this.groupChatController = new GroupChatController(io);
    }

    /**
     * Handle new socket connection
     * @param {Object} socket - Socket.IO socket instance
     */
    async handleConnection(socket) {
        console.log(`Socket connected: ${socket.id}`);

        // Initialize user through controller (using socket.id temporarily)
        const user = this.userController.createUser(socket.id);

        // Send connection confirmation and request device registration
        socket.emit('connected', {
            socketId: socket.id,
            timestamp: new Date(),
            message: 'Please register your device using registerDevice event'
        });

        // Register all event handlers
        this.registerEventHandlers(socket);
    }

    /**
     * Handle device registration
     * @param {Object} socket - Socket.IO socket instance
     * @param {Object} data - Device registration data
     */
    async handleRegisterDevice(socket, data) {
        if (!data || !data.deviceId) {
            socket.emit('error', 'Device ID is required for registration');
            return;
        }

        const deviceId = data.deviceId.toString().trim();

        if (!deviceId) {
            socket.emit('error', 'Valid Device ID is required');
            return;
        }

        console.log(`Device registered: ${deviceId} (Socket: ${socket.id})`);

        // Store device ID in socket for later use
        socket.deviceId = deviceId;

        // Log user login to database
        try {
            const UserData = require('../models/UserData');
            const LoginLogs = require('../models/LoginLogs');

            // Update user data with login
            await UserData.userLogin(deviceId);

            // Log the login event
            await LoginLogs.logLogin(deviceId);

            console.log(`Device ${deviceId} login logged to database`);
        } catch (error) {
            console.error(`Failed to log device login: ${error.message}`);
        }

        // Update user controller with device ID
        const user = this.userController.getUser(socket.id);
        if (user) {
            user.deviceId = deviceId;
        }

        // Send registration confirmation
        socket.emit('deviceRegistered', {
            deviceId: deviceId,
            socketId: socket.id,
            timestamp: new Date(),
            message: 'Device registered successfully'
        });

        // Broadcast updated user count
        this.broadcastActiveUsers();
    }

    /**
     * Register all socket event handlers
     * @param {Object} socket - Socket.IO socket instance
     */
    registerEventHandlers(socket) {
        // Device registration event - must be called first by client
        socket.on('registerDevice', (data) => this.handleRegisterDevice(socket, data));

        // One-on-one chat events
        socket.on('startChat', () => this.handleStartChat(socket));
        socket.on('sendMessage', (data) => this.handleSendMessage(socket, data));
        socket.on('endChat', () => this.handleEndChat(socket));
        socket.on('skipChat', () => this.handleSkipChat(socket));

        // Group chat events
        socket.on('joinGroup', () => this.handleJoinGroup(socket));
        socket.on('sendGroupMessage', (data) => this.handleSendGroupMessage(socket, data));
        socket.on('endGroupChat', () => this.handleEndGroupChat(socket));

        // Profile management events
        socket.on('manageProfile', (data) => this.handleManageProfile(socket, data));
        socket.on('getProfile', () => this.handleGetProfile(socket));

        // Preference management events
        socket.on('setGenderPreference', (data) => this.handleSetGenderPreference(socket, data));
        socket.on('removeGenderPreference', () => this.handleRemoveGenderPreference(socket));

        // Utility events
        socket.on('getActiveUsers', () => this.handleGetActiveUsers(socket));
        socket.on('getStats', () => this.handleGetStats(socket));
        socket.on('getGroupStats', () => this.handleGetGroupStats(socket));

        // Disconnect event
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    /**
     * Handle start chat request
     */
    handleStartChat(socket) {
        const result = this.chatController.findAndStartChat(socket.id);

        if (!result.success) {
            socket.emit('error', result.error);
            return;
        }

        if (result.matched) {
            console.log(`Chat matched: ${socket.id} <-> ${result.partnerId}`);
        } else {
            socket.emit('waitingForPartner');
            console.log(`User ${socket.id} added to waiting list`);
        }
    }

    /**
     * Handle send message request
     */
    handleSendMessage(socket, data) {
        const result = this.chatController.sendMessage(socket.id, data.message);

        if (!result.success) {
            socket.emit('error', result.error);
        }
    }

    /**
     * Handle end chat request
     */
    handleEndChat(socket) {
        const result = this.chatController.endChat(socket.id);

        if (!result.success) {
            socket.emit('error', result.error);
        }
    }

    /**
     * Handle skip chat request
     */
    handleSkipChat(socket) {
        const result = this.chatController.skipChat(socket.id);

        if (!result.success) {
            socket.emit('error', result.error);
        }
    }

    /**
     * Handle join group request
     */
    handleJoinGroup(socket) {
        const user = this.userController.getUser(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        if (user.isInChat) {
            socket.emit('error', 'Cannot join group while in 1-on-1 chat. End current chat first.');
            return;
        }

        const result = this.groupChatController.joinGroupChat(socket.id);

        if (!result.success) {
            socket.emit('error', result.error);
        } else {
            console.log(`User ${socket.id} joined group chat: ${result.groupId}`);
        }
    }

    /**
     * Handle send group message request
     */
    handleSendGroupMessage(socket, data) {
        const result = this.groupChatController.sendGroupMessage(socket.id, data.message);

        if (!result.success) {
            socket.emit('error', result.error);
        }
    }

    /**
     * Handle end group chat request
     */
    handleEndGroupChat(socket) {
        const result = this.groupChatController.leaveGroupChat(socket.id);

        if (!result.success) {
            socket.emit('error', result.error);
        } else {
            console.log(`User ${socket.id} left group chat`);
        }
    }

    /**
     * Handle profile management request
     */
    handleManageProfile(socket, data) {
        // Validate input
        const validation = this.userController.validateUserData(data);
        if (!validation.isValid) {
            socket.emit('error', `Validation failed: ${validation.errors.join(', ')}`);
            return;
        }

        const updatedProfile = this.userController.updateUserProfile(socket.id, data);

        if (updatedProfile) {
            socket.emit('profileUpdated', {
                profile: updatedProfile,
                message: 'Profile updated successfully'
            });
            console.log(`Profile updated for user: ${socket.id}`);
        } else {
            socket.emit('error', 'Failed to update profile');
        }
    }

    /**
     * Handle get profile request
     */
    handleGetProfile(socket) {
        const profileData = this.userController.getUserProfileData(socket.id);

        if (profileData) {
            socket.emit('profileData', profileData);
        } else {
            socket.emit('error', 'Profile not found');
        }
    }

    /**
     * Handle set gender preference request
     */
    handleSetGenderPreference(socket, data) {
        // Validate preference
        const validPreferences = ['male', 'female', 'any'];
        const preferredGender = validPreferences.includes(data.preferredGender)
            ? data.preferredGender
            : 'any';

        const preferences = this.userController.updateUserPreferences(socket.id, { preferredGender });

        if (preferences) {
            socket.emit('genderPreferenceUpdated', {
                preferences: preferences,
                message: `Gender preference set to: ${preferredGender}`
            });
            console.log(`Gender preference updated for user: ${socket.id} to ${preferredGender}`);
        } else {
            socket.emit('error', 'Failed to update preferences');
        }
    }

    /**
     * Handle remove gender preference request
     */
    handleRemoveGenderPreference(socket) {
        const preferences = this.userController.updateUserPreferences(socket.id, { preferredGender: 'any' });

        if (preferences) {
            socket.emit('genderPreferenceUpdated', {
                preferences: preferences,
                message: 'Gender preference removed - will match with anyone'
            });
            console.log(`Gender preference removed for user: ${socket.id}`);
        } else {
            socket.emit('error', 'Failed to update preferences');
        }
    }

    /**
     * Handle get active users request
     */
    handleGetActiveUsers(socket) {
        const count = this.userController.getActiveUsersCount();
        socket.emit('activeUsers', count);
    }

    /**
     * Handle get statistics request
     */
    handleGetStats(socket) {
        const userStats = this.userController.getUserStats();
        const chatStats = this.chatController.getChatStats();

        socket.emit('serverStats', {
            users: userStats,
            chats: chatStats,
            timestamp: new Date()
        });
    }

    /**
     * Handle get group statistics request
     */
    handleGetGroupStats(socket) {
        const groupStats = this.groupChatController.getGroupStats();
        socket.emit('groupStats', groupStats);
    }

    /**
     * Handle user disconnect
     */
    async handleDisconnect(socket) {
        const deviceId = socket.deviceId;
        console.log(`Socket disconnected: ${socket.id}${deviceId ? ` (Device: ${deviceId})` : ''}`);

        // Log user logout to database if device was registered
        if (deviceId) {
            try {
                const UserData = require('../models/UserData');
                const LoginLogs = require('../models/LoginLogs');

                // Update user data with logout
                await UserData.userLogout(deviceId);

                // Log the logout event
                await LoginLogs.logLogout(deviceId);

                console.log(`Device ${deviceId} logout logged to database`);
            } catch (error) {
                console.error(`Failed to log device logout: ${error.message}`);
            }
        }

        // End any active chat
        this.chatController.endChat(socket.id);

        // Leave any group chat
        this.groupChatController.forceRemoveUserFromGroups(socket.id);

        // Remove from waiting lists
        MatchingService.removeFromWaitingList(socket.id);

        // Delete user
        this.userController.deleteUser(socket.id);

        // Broadcast updated user count
        this.broadcastActiveUsers();
    }

    /**
     * Broadcast active users count to all clients
     */
    broadcastActiveUsers() {
        const count = this.userController.getActiveUsersCount();
        this.io.emit('activeUsers', count);
    }

    /**
     * Broadcast server statistics to all clients
     */
    broadcastStats() {
        const userStats = this.userController.getUserStats();
        const chatStats = this.chatController.getChatStats();
        const groupStats = this.groupChatController.getGroupStats();

        this.io.emit('serverStats', {
            users: userStats,
            chats: chatStats,
            groups: groupStats,
            timestamp: new Date()
        });
    }

    /**
     * Send error message to socket
     * @param {Object} socket - Socket instance
     * @param {string} message - Error message
     * @param {string} code - Error code (optional)
     */
    sendError(socket, message, code = 'GENERAL_ERROR') {
        socket.emit('error', {
            message,
            code,
            timestamp: new Date()
        });
    }

    /**
     * Send success message to socket
     * @param {Object} socket - Socket instance
     * @param {string} message - Success message
     * @param {Object} data - Additional data (optional)
     */
    sendSuccess(socket, message, data = {}) {
        socket.emit('success', {
            message,
            data,
            timestamp: new Date()
        });
    }
}

module.exports = SocketView;
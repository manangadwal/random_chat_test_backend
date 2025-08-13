/**
 * Socket.IO event handler
 * Manages all WebSocket connections and events
 */

const {
    initializeUser,
    cleanupUser,
    getUser,
    getUserProfile,
    updateUserProfile,
    updateUserPreferences,
    users
} = require('../storage/memoryStorage');
const MatchingService = require('../services/matchingService');
const ChatService = require('../services/chatService');

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.chatService = new ChatService(io);
    }

    /**
     * Handle new socket connection
     * @param {Object} socket - Socket.IO socket instance
     */
    handleConnection(socket) {
        console.log(`User connected: ${socket.id}`);

        // Initialize user data
        initializeUser(socket.id);

        // Send connection confirmation
        socket.emit('connected', {
            userId: socket.id,
            timestamp: new Date(),
            requiresProfileSetup: true
        });

        // Broadcast updated user count
        this.io.emit('activeUsers', users.size);

        // Register all event handlers
        this.registerEventHandlers(socket);
    }

    /**
     * Register all socket event handlers
     * @param {Object} socket - Socket.IO socket instance
     */
    registerEventHandlers(socket) {
        // Chat-related events
        socket.on('startChat', () => this.handleStartChat(socket));
        socket.on('sendMessage', (data) => this.handleSendMessage(socket, data));
        socket.on('endChat', () => this.handleEndChat(socket));
        socket.on('skipChat', () => this.handleSkipChat(socket));

        // Profile management events
        socket.on('manageProfile', (data) => this.handleManageProfile(socket, data));
        socket.on('getProfile', () => this.handleGetProfile(socket));

        // Preference management events
        socket.on('setGenderPreference', (data) => this.handleSetGenderPreference(socket, data));
        socket.on('removeGenderPreference', () => this.handleRemoveGenderPreference(socket));

        // Utility events
        socket.on('getActiveUsers', () => this.handleGetActiveUsers(socket));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    /**
     * Handle start chat request
     * @param {Object} socket - Socket.IO socket instance
     */
    handleStartChat(socket) {
        const user = getUser(socket.id);
        if (!user || user.isInChat) {
            socket.emit('error', 'Already in chat or invalid user');
            return;
        }

        // Try to find a compatible partner
        const compatiblePartner = MatchingService.findCompatiblePartner(socket.id);

        if (compatiblePartner) {
            // Remove partner from waiting list and start chat
            MatchingService.removeFromWaitingList(compatiblePartner);
            this.chatService.startChat(socket.id, compatiblePartner);
            console.log(`Chat matched: ${socket.id} <-> ${compatiblePartner}`);
        } else {
            // Add to waiting list
            MatchingService.addToWaitingList(socket.id, user.preferences);
            socket.emit('waitingForPartner');
            console.log(`User ${socket.id} added to waiting list`);
        }
    }

    /**
     * Handle send message request
     * @param {Object} socket - Socket.IO socket instance
     * @param {Object} data - Message data
     */
    handleSendMessage(socket, data) {
        try {
            this.chatService.sendMessage(socket.id, data.message);
        } catch (error) {
            socket.emit('error', error.message);
        }
    }

    /**
     * Handle end chat request
     * @param {Object} socket - Socket.IO socket instance
     */
    handleEndChat(socket) {
        this.chatService.endChat(socket.id);
    }

    /**
     * Handle skip chat request (end current and start new)
     * @param {Object} socket - Socket.IO socket instance
     */
    handleSkipChat(socket) {
        // End current chat
        this.chatService.endChat(socket.id);

        // Automatically try to start new chat after brief delay
        setTimeout(() => {
            const user = getUser(socket.id);
            if (user && !user.isInChat) {
                this.handleStartChat(socket);
            }
        }, 100);
    }

    /**
     * Handle profile management (setup/update)
     * @param {Object} socket - Socket.IO socket instance
     * @param {Object} data - Profile data
     */
    handleManageProfile(socket, data) {
        const user = getUser(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        const updatedProfile = updateUserProfile(socket.id, data);
        if (updatedProfile) {
            user.profileSetup = true;
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
     * @param {Object} socket - Socket.IO socket instance
     */
    handleGetProfile(socket) {
        const profile = getUserProfile(socket.id);
        const user = getUser(socket.id);

        socket.emit('profileData', {
            profile: profile,
            preferences: user?.preferences || { preferredGender: 'any' }
        });
    }

    /**
     * Handle set gender preference request
     * @param {Object} socket - Socket.IO socket instance
     * @param {Object} data - Preference data
     */
    handleSetGenderPreference(socket, data) {
        const user = getUser(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        // Validate and set preference
        let preferredGender = 'any'; // default
        if (data.preferredGender && ['male', 'female', 'any'].includes(data.preferredGender)) {
            preferredGender = data.preferredGender;
        }

        const preferences = updateUserPreferences(socket.id, { preferredGender });

        socket.emit('genderPreferenceUpdated', {
            preferences: preferences,
            message: `Gender preference set to: ${preferredGender}`
        });

        console.log(`Gender preference updated for user: ${socket.id} to ${preferredGender}`);
    }

    /**
     * Handle remove gender preference request
     * @param {Object} socket - Socket.IO socket instance
     */
    handleRemoveGenderPreference(socket) {
        const user = getUser(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        const preferences = updateUserPreferences(socket.id, { preferredGender: 'any' });

        socket.emit('genderPreferenceUpdated', {
            preferences: preferences,
            message: 'Gender preference removed - will match with anyone'
        });

        console.log(`Gender preference removed for user: ${socket.id}`);
    }

    /**
     * Handle get active users count request
     * @param {Object} socket - Socket.IO socket instance
     */
    handleGetActiveUsers(socket) {
        socket.emit('activeUsers', users.size);
    }

    /**
     * Handle user disconnect
     * @param {Object} socket - Socket.IO socket instance
     */
    handleDisconnect(socket) {
        console.log(`User disconnected: ${socket.id}`);

        // End any active chat
        this.chatService.endChat(socket.id);

        // Remove from waiting list
        MatchingService.removeFromWaitingList(socket.id);

        // Clean up user data
        cleanupUser(socket.id);

        // Broadcast updated user count
        this.io.emit('activeUsers', users.size);
    }
}

module.exports = SocketHandler;
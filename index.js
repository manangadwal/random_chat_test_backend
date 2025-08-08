const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const ProfanityFilter = require('./profanityFilter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = new Map(); // socketId -> user info with profile
const waitingUsers = new Map(); // socketId -> user preferences for matching
const activeChats = new Map(); // chatId -> {user1, user2}
const chatRooms = new Map(); // socketId -> chatId
const userProfiles = new Map(); // socketId -> profile data

// Initialize profanity filter
const profanityFilter = new ProfanityFilter();

// Generate unique chat ID
function generateChatId() {
    return 'chat_' + Math.random().toString(36).substring(2, 11);
}

// Find compatible partner based on preferences
function findCompatiblePartner(userId) {
    const user = users.get(userId);
    const userProfile = userProfiles.get(userId);

    if (!user) return null;

    const userPreferences = user.preferences || {};

    // Check all waiting users for compatibility
    for (const [waitingUserId, waitingData] of waitingUsers) {
        if (waitingUserId === userId) continue;

        const waitingUser = users.get(waitingUserId);
        const waitingProfile = userProfiles.get(waitingUserId);
        const waitingPreferences = waitingUser?.preferences || {};

        if (!waitingUser) continue;

        // Check gender compatibility
        if (isGenderCompatible(userProfile, userPreferences, waitingProfile, waitingPreferences)) {
            return waitingUserId;
        }
    }

    return null;
}

// Check gender compatibility
function isGenderCompatible(userProfile, userPrefs, partnerProfile, partnerPrefs) {
    const userGender = userProfile?.gender;
    const partnerGender = partnerProfile?.gender;
    const userPrefGender = userPrefs?.preferredGender || 'any';
    const partnerPrefGender = partnerPrefs?.preferredGender || 'any';

    // If either user has no gender preference, match is possible
    if (userPrefGender === 'any' || partnerPrefGender === 'any') return true;

    // If profiles are incomplete, allow matching
    if (!userGender || !partnerGender) return true;

    // Check mutual compatibility - both users' preferences must be satisfied
    const userSatisfied = userPrefGender === 'any' || userPrefGender === partnerGender;
    const partnerSatisfied = partnerPrefGender === 'any' || partnerPrefGender === userGender;

    return userSatisfied && partnerSatisfied;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Store user info with default profile
    users.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        isInChat: false
    });

    // Initialize empty profile with 
    // Initialize empty profile
    userProfiles.set(socket.id, {
        name: null,
        gender: null,
        avatar: null,
        isProfileComplete: false
    });

    // Emit connection events
    socket.emit('connected', {
        userId: socket.id,
        timestamp: new Date(),
        requiresProfileSetup: true
    });

    // Emit active users count
    io.emit('activeUsers', users.size);

    // Event: Start new chat with random stranger
    socket.on('startChat', () => {
        const user = users.get(socket.id);
        if (!user || user.isInChat) {
            socket.emit('error', 'Already in chat or invalid user');
            return;
        }

        // Find compatible partner based on preferences
        const compatiblePartner = findCompatiblePartner(socket.id);

        if (compatiblePartner) {
            // Match with compatible user
            const chatId = generateChatId();
            const partner = users.get(compatiblePartner);

            // Remove from waiting list
            waitingUsers.delete(compatiblePartner);

            // Update user status
            user.isInChat = true;
            partner.isInChat = true;

            // Store chat info
            activeChats.set(chatId, {
                user1: socket.id,
                user2: compatiblePartner,
                startedAt: new Date()
            });

            chatRooms.set(socket.id, chatId);
            chatRooms.set(compatiblePartner, chatId);

            // Join both users to the chat room
            socket.join(chatId);
            io.sockets.sockets.get(compatiblePartner).join(chatId);

            // Get partner profile info for display
            const userProfile = userProfiles.get(socket.id);
            const partnerProfile = userProfiles.get(compatiblePartner);

            // Notify both users with partner info
            socket.emit('chatStarted', {
                chatId,
                partnerId: compatiblePartner,
                partnerInfo: {
                    name: partnerProfile?.name || 'Anonymous',
                    avatar: partnerProfile?.avatar || null,
                    gender: partnerProfile?.gender || null
                }
            });
            io.to(compatiblePartner).emit('chatStarted', {
                chatId,
                partnerId: socket.id,
                partnerInfo: {
                    name: userProfile?.name || 'Anonymous',
                    avatar: userProfile?.avatar || null,
                    gender: userProfile?.gender || null
                }
            });

            console.log(`Chat started: ${socket.id} <-> ${compatiblePartner}`);
        } else {
            // Add to waiting list with preferences
            waitingUsers.set(socket.id, {
                userId: socket.id,
                preferences: user.preferences || {},
                joinedAt: new Date()
            });
            socket.emit('waitingForPartner');
            console.log(`User ${socket.id} added to waiting list`);
        }
    });

    // Event: Send message in chat
    socket.on('sendMessage', (data) => {
        const chatId = chatRooms.get(socket.id);
        if (!chatId) {
            socket.emit('error', 'Not in any chat');
            return;
        }

        // Filter profanity from message
        const originalMessage = data.message || '';
        const filteredMessage = profanityFilter.filterMessage(originalMessage);

        // Log if profanity was detected
        if (profanityFilter.containsProfanity(originalMessage)) {
            console.log(`Profanity filtered in ${chatId} from ${socket.id}: "${originalMessage}" -> "${filteredMessage}"`);
        }

        const message = {
            senderId: socket.id,
            message: filteredMessage,
            timestamp: new Date()
        };

        // Send to chat room (excluding sender)
        socket.to(chatId).emit('messageReceived', message);
        console.log(`Message in ${chatId}: ${filteredMessage}`);
    });

    // Event: End current chat
    socket.on('endChat', () => {
        endUserChat(socket.id);
    });

    // Event: Skip to next chat
    socket.on('skipChat', () => {
        endUserChat(socket.id);
        // Automatically start looking for new chat
        setTimeout(() => {
            const user = users.get(socket.id);
            if (user && !user.isInChat) {
                // Find compatible partner based on preferences
                const compatiblePartner = findCompatiblePartner(socket.id);

                if (compatiblePartner) {
                    // Match with compatible user
                    const chatId = generateChatId();
                    const partner = users.get(compatiblePartner);

                    // Remove from waiting list
                    waitingUsers.delete(compatiblePartner);

                    // Update user status
                    user.isInChat = true;
                    partner.isInChat = true;

                    // Store chat info
                    activeChats.set(chatId, {
                        user1: socket.id,
                        user2: compatiblePartner,
                        startedAt: new Date()
                    });

                    chatRooms.set(socket.id, chatId);
                    chatRooms.set(compatiblePartner, chatId);

                    // Join both users to the chat room
                    socket.join(chatId);
                    io.sockets.sockets.get(compatiblePartner).join(chatId);

                    // Get partner profile info for display
                    const userProfile = userProfiles.get(socket.id);
                    const partnerProfile = userProfiles.get(compatiblePartner);

                    // Notify both users with partner info
                    socket.emit('chatStarted', {
                        chatId,
                        partnerId: compatiblePartner,
                        partnerInfo: {
                            name: partnerProfile?.name || 'Anonymous',
                            avatar: partnerProfile?.avatar || null,
                            gender: partnerProfile?.gender || null
                        }
                    });
                    io.to(compatiblePartner).emit('chatStarted', {
                        chatId,
                        partnerId: socket.id,
                        partnerInfo: {
                            name: userProfile?.name || 'Anonymous',
                            avatar: userProfile?.avatar || null,
                            gender: userProfile?.gender || null
                        }
                    });

                    console.log(`Chat started after skip: ${socket.id} <-> ${compatiblePartner}`);
                } else {
                    // Add to waiting list with preferences
                    waitingUsers.set(socket.id, {
                        userId: socket.id,
                        preferences: user.preferences || {},
                        joinedAt: new Date()
                    });
                    socket.emit('waitingForPartner');
                    console.log(`User ${socket.id} added to waiting list after skip`);
                }
            }
        }, 100);
    });

    // Event: Manage user profile (single event for setup/update)
    socket.on('manageProfile', (data) => {
        const profile = userProfiles.get(socket.id);
        const user = users.get(socket.id);

        if (!profile || !user) {
            socket.emit('error', 'User not found');
            return;
        }

        // Update profile with provided data (only update fields that are provided)
        const updatedProfile = {
            name: data.name !== undefined ? data.name : profile.name,
            gender: data.gender !== undefined ? data.gender : profile.gender,
            avatar: data.avatar !== undefined ? data.avatar : profile.avatar,
            isProfileComplete: true
        };

        userProfiles.set(socket.id, updatedProfile);
        user.profileSetup = true;

        socket.emit('profileUpdated', {
            profile: updatedProfile,
            message: 'Profile updated successfully'
        });

        console.log(`Profile updated for user: ${socket.id}`);
    });

    // Event: Set gender preference for matching
    socket.on('setGenderPreference', (data) => {
        const user = users.get(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        // Handle preference removal or setting
        let preferredGender = 'any'; // default
        if (data.preferredGender && ['male', 'female', 'any'].includes(data.preferredGender)) {
            preferredGender = data.preferredGender;
        }

        const preferences = { preferredGender };

        // Store preferences for matching
        user.preferences = preferences;

        socket.emit('genderPreferenceUpdated', {
            preferences: preferences,
            message: `Gender preference set to: ${preferredGender}`
        });

        console.log(`Gender preference updated for user: ${socket.id} to ${preferredGender}`);
    });

    // Event: Remove gender preference (set to 'any')
    socket.on('removeGenderPreference', () => {
        const user = users.get(socket.id);
        if (!user) {
            socket.emit('error', 'User not found');
            return;
        }

        const preferences = { preferredGender: 'any' };
        user.preferences = preferences;

        socket.emit('genderPreferenceUpdated', {
            preferences: preferences,
            message: 'Gender preference removed - will match with anyone'
        });

        console.log(`Gender preference removed for user: ${socket.id}`);
    });

    // Event: Get user profile and preferences
    socket.on('getProfile', () => {
        const profile = userProfiles.get(socket.id);
        const user = users.get(socket.id);

        socket.emit('profileData', {
            profile: profile,
            preferences: user?.preferences || { preferredGender: 'any' }
        });
    });

    // Event: Get active users count
    socket.on('getActiveUsers', () => {
        socket.emit('activeUsers', users.size);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Clean up user data
        endUserChat(socket.id);
        waitingUsers.delete(socket.id);
        users.delete(socket.id);
        userProfiles.delete(socket.id);

        // Emit updated active users count
        io.emit('activeUsers', users.size);
    });
});

// Helper function to end user's chat
function endUserChat(socketId) {
    const chatId = chatRooms.get(socketId);
    if (!chatId) return;

    const chat = activeChats.get(chatId);
    if (!chat) return;

    const partnerId = chat.user1 === socketId ? chat.user2 : chat.user1;

    // Update user status
    const user = users.get(socketId);
    const partner = users.get(partnerId);

    if (user) user.isInChat = false;
    if (partner) partner.isInChat = false;

    // Leave chat rooms
    const userSocket = io.sockets.sockets.get(socketId);
    const partnerSocket = io.sockets.sockets.get(partnerId);

    if (userSocket) userSocket.leave(chatId);
    if (partnerSocket) {
        partnerSocket.leave(chatId);
        partnerSocket.emit('chatEnded');
    }

    // Clean up chat data
    chatRooms.delete(socketId);
    chatRooms.delete(partnerId);
    activeChats.delete(chatId);

    console.log(`Chat ended: ${chatId}`);
}

// Basic HTTP endpoint for health check
app.get('/', (req, res) => {
    const profilesCompleted = Array.from(userProfiles.values()).filter(p => p.isProfileComplete).length;

    res.json({
        message: 'Random Chat Server is running',
        activeUsers: users.size,
        activeChats: activeChats.size,
        waitingUsers: waitingUsers.size,
        profilesCompleted: profilesCompleted,
        profilesTotal: userProfiles.size
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
});
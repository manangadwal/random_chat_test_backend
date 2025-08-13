/**
 * Chat service for managing chat sessions and messaging
 * Handles chat creation, message routing, and chat cleanup
 */

const { users, activeChats, chatRooms, userProfiles } = require('../storage/memoryStorage');
const ProfanityFilter = require('../filters/profanityFilter');

class ChatService {
    constructor(io) {
        this.io = io;
        this.profanityFilter = new ProfanityFilter();
    }

    /**
     * Generate unique chat room ID
     * @returns {string} Unique chat ID
     */
    generateChatId() {
        return 'chat_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Start a new chat between two users
     * @param {string} user1Id - First user's socket ID
     * @param {string} user2Id - Second user's socket ID
     * @returns {string} Chat ID of created chat
     */
    startChat(user1Id, user2Id) {
        const chatId = this.generateChatId();
        const user1 = users.get(user1Id);
        const user2 = users.get(user2Id);

        if (!user1 || !user2) {
            throw new Error('One or both users not found');
        }

        // Update user status
        user1.isInChat = true;
        user2.isInChat = true;

        // Store chat information
        activeChats.set(chatId, {
            user1: user1Id,
            user2: user2Id,
            startedAt: new Date()
        });

        // Map users to chat room
        chatRooms.set(user1Id, chatId);
        chatRooms.set(user2Id, chatId);

        // Join both users to the chat room
        const user1Socket = this.io.sockets.sockets.get(user1Id);
        const user2Socket = this.io.sockets.sockets.get(user2Id);

        if (user1Socket) user1Socket.join(chatId);
        if (user2Socket) user2Socket.join(chatId);

        // Get profile information for both users
        const user1Profile = userProfiles.get(user1Id);
        const user2Profile = userProfiles.get(user2Id);

        // Notify both users about chat start with partner info
        if (user1Socket) {
            user1Socket.emit('chatStarted', {
                chatId,
                partnerId: user2Id,
                partnerInfo: {
                    name: user2Profile?.name || 'Anonymous',
                    avatar: user2Profile?.avatar || null,
                    gender: user2Profile?.gender || null
                }
            });
        }

        if (user2Socket) {
            user2Socket.emit('chatStarted', {
                chatId,
                partnerId: user1Id,
                partnerInfo: {
                    name: user1Profile?.name || 'Anonymous',
                    avatar: user1Profile?.avatar || null,
                    gender: user1Profile?.gender || null
                }
            });
        }

        console.log(`Chat started: ${user1Id} <-> ${user2Id} (${chatId})`);
        return chatId;
    }

    /**
     * Send a message in a chat room
     * @param {string} senderId - Socket ID of message sender
     * @param {string} message - Message content
     */
    sendMessage(senderId, message) {
        const chatId = chatRooms.get(senderId);
        if (!chatId) {
            throw new Error('User not in any chat');
        }

        // Filter profanity from message
        const originalMessage = message || '';
        const filteredMessage = this.profanityFilter.filterMessage(originalMessage);

        // Log if profanity was detected
        if (this.profanityFilter.containsProfanity(originalMessage)) {
            console.log(`Profanity filtered in ${chatId} from ${senderId}: "${originalMessage}" -> "${filteredMessage}"`);
        }

        const messageData = {
            senderId: senderId,
            message: filteredMessage,
            timestamp: new Date()
        };

        // Send to chat room (excluding sender)
        const senderSocket = this.io.sockets.sockets.get(senderId);
        if (senderSocket) {
            senderSocket.to(chatId).emit('messageReceived', messageData);
        }

        console.log(`Message in ${chatId}: ${filteredMessage}`);
    }

    /**
     * End a chat session for a user
     * @param {string} socketId - Socket ID of user ending chat
     */
    endChat(socketId) {
        const chatId = chatRooms.get(socketId);
        if (!chatId) return;

        const chat = activeChats.get(chatId);
        if (!chat) return;

        // Find partner ID
        const partnerId = chat.user1 === socketId ? chat.user2 : chat.user1;

        // Update user status
        const user = users.get(socketId);
        const partner = users.get(partnerId);

        if (user) user.isInChat = false;
        if (partner) partner.isInChat = false;

        // Leave chat rooms
        const userSocket = this.io.sockets.sockets.get(socketId);
        const partnerSocket = this.io.sockets.sockets.get(partnerId);

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
}

module.exports = ChatService;
/**
 * Chat Controller
 * Handles one-on-one chat operations and business logic
 */

const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ChatRepository = require('../repositories/ChatRepository');
const UserController = require('./UserController');
const MatchingService = require('../services/matchingService');
const ProfanityFilter = require('../filters/profanityFilter');

class ChatController {
    constructor(io) {
        this.io = io;
        this.chatRepository = new ChatRepository();
        this.userController = new UserController();
        this.profanityFilter = new ProfanityFilter();
    }

    /**
     * Start a new chat between two users
     * @param {string} user1Id - First user's socket ID
     * @param {string} user2Id - Second user's socket ID
     * @returns {Object} Chat start result
     */
    startChat(user1Id, user2Id) {
        try {
            // Validate users exist and are available
            const user1 = this.userController.getUser(user1Id);
            const user2 = this.userController.getUser(user2Id);

            if (!user1 || !user2) {
                throw new Error('One or both users not found');
            }

            if (user1.isInChat || user2.isInChat) {
                throw new Error('One or both users are already in chat');
            }

            // Create new chat
            const chat = new Chat(user1Id, user2Id);
            this.chatRepository.save(chat);

            // Update user statuses
            this.userController.setUserChatStatus(user1Id, true);
            this.userController.setUserChatStatus(user2Id, true);

            // Join users to socket room
            const user1Socket = this.io.sockets.sockets.get(user1Id);
            const user2Socket = this.io.sockets.sockets.get(user2Id);

            if (user1Socket) user1Socket.join(chat.id);
            if (user2Socket) user2Socket.join(chat.id);

            // Get partner info for both users
            const user1PartnerInfo = this.userController.getUserPartnerInfo(user2Id);
            const user2PartnerInfo = this.userController.getUserPartnerInfo(user1Id);

            // Notify both users about chat start
            if (user1Socket) {
                user1Socket.emit('chatStarted', {
                    chatId: chat.id,
                    partnerId: user2Id,
                    partnerInfo: user1PartnerInfo
                });
            }

            if (user2Socket) {
                user2Socket.emit('chatStarted', {
                    chatId: chat.id,
                    partnerId: user1Id,
                    partnerInfo: user2PartnerInfo
                });
            }

            console.log(`Chat started: ${user1Id} <-> ${user2Id} (${chat.id})`);

            return {
                success: true,
                chatId: chat.id,
                participants: [user1Id, user2Id]
            };

        } catch (error) {
            console.error('Error starting chat:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find and start chat with compatible partner
     * @param {string} userId - User looking for chat
     * @returns {Object} Match result
     */
    findAndStartChat(userId) {
        try {
            const user = this.userController.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.isInChat) {
                throw new Error('User is already in chat');
            }

            // Try to find compatible partner
            const compatiblePartner = MatchingService.findCompatiblePartner(userId);

            if (compatiblePartner) {
                // Remove partner from waiting list and start chat
                MatchingService.removeFromWaitingList(compatiblePartner);
                const result = this.startChat(userId, compatiblePartner);

                return {
                    success: true,
                    matched: true,
                    chatId: result.chatId,
                    partnerId: compatiblePartner
                };
            } else {
                // Add to waiting list
                MatchingService.addToWaitingList(userId, user.preferences);

                return {
                    success: true,
                    matched: false,
                    waiting: true
                };
            }

        } catch (error) {
            console.error('Error finding chat partner:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send message in chat
     * @param {string} senderId - Message sender ID
     * @param {string} messageContent - Message content
     * @returns {Object} Send result
     */
    sendMessage(senderId, messageContent) {
        try {
            // Find user's active chat
            const chat = this.chatRepository.findByParticipant(senderId);
            if (!chat || !chat.isActive) {
                throw new Error('User not in any active chat');
            }

            // Create message
            const message = new Message(senderId, messageContent, chat.id);

            // Apply profanity filter
            const filteredContent = this.profanityFilter.filterMessage(messageContent);
            if (filteredContent !== messageContent) {
                message.applyFilter(filteredContent, 'profanity');
                console.log(`Profanity filtered in ${chat.id} from ${senderId}: "${messageContent}" -> "${filteredContent}"`);
            }

            // Add message to chat
            chat.addMessage(senderId, message.content, message.timestamp);
            this.chatRepository.save(chat);

            // Get sender info for display
            const senderInfo = this.userController.getUserPartnerInfo(senderId);

            // Send to chat room (excluding sender)
            const senderSocket = this.io.sockets.sockets.get(senderId);
            if (senderSocket) {
                senderSocket.to(chat.id).emit('messageReceived', message.getDisplayMessage(senderInfo));
            }

            console.log(`Message in ${chat.id}: ${message.content}`);

            return {
                success: true,
                messageId: message.id,
                filtered: message.isFiltered
            };

        } catch (error) {
            console.error('Error sending message:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * End chat session
     * @param {string} userId - User ending the chat
     * @returns {Object} End result
     */
    endChat(userId) {
        try {
            const chat = this.chatRepository.findByParticipant(userId);
            if (!chat || !chat.isActive) {
                return { success: true, message: 'No active chat to end' };
            }

            const partnerId = chat.getPartnerId(userId);

            // Update user statuses
            this.userController.setUserChatStatus(userId, false);
            if (partnerId) {
                this.userController.setUserChatStatus(partnerId, false);
            }

            // Leave socket rooms
            const userSocket = this.io.sockets.sockets.get(userId);
            const partnerSocket = this.io.sockets.sockets.get(partnerId);

            if (userSocket) userSocket.leave(chat.id);
            if (partnerSocket) {
                partnerSocket.leave(chat.id);
                partnerSocket.emit('chatEnded');
            }

            // End chat
            chat.endChat();
            this.chatRepository.save(chat);

            console.log(`Chat ended: ${chat.id}`);

            return {
                success: true,
                chatId: chat.id,
                duration: chat.getDuration()
            };

        } catch (error) {
            console.error('Error ending chat:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Skip current chat and find new partner
     * @param {string} userId - User skipping chat
     * @returns {Object} Skip result
     */
    skipChat(userId) {
        try {
            // End current chat
            const endResult = this.endChat(userId);
            if (!endResult.success) {
                return endResult;
            }

            // Try to find new chat after brief delay
            setTimeout(() => {
                const user = this.userController.getUser(userId);
                if (user && !user.isInChat) {
                    this.findAndStartChat(userId);
                }
            }, 100);

            return {
                success: true,
                message: 'Chat skipped, looking for new partner'
            };

        } catch (error) {
            console.error('Error skipping chat:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get chat statistics
     * @returns {Object} Chat statistics
     */
    getChatStats() {
        const allChats = this.chatRepository.findAll();
        const activeChats = allChats.filter(chat => chat.isActive);
        const completedChats = allChats.filter(chat => !chat.isActive);

        const totalMessages = allChats.reduce((sum, chat) => sum + chat.messages.length, 0);
        const avgDuration = completedChats.length > 0
            ? completedChats.reduce((sum, chat) => sum + chat.getDuration(), 0) / completedChats.length
            : 0;

        return {
            totalChats: allChats.length,
            activeChats: activeChats.length,
            completedChats: completedChats.length,
            totalMessages,
            averageDuration: Math.round(avgDuration / 1000), // in seconds
            waitingUsers: MatchingService.getWaitingUsersCount()
        };
    }

    /**
     * Get user's chat history
     * @param {string} userId - User ID
     * @returns {Array} Array of user's chats
     */
    getUserChatHistory(userId) {
        return this.chatRepository.findByParticipant(userId, false); // Include inactive chats
    }

    /**
     * Clean up inactive chats (for maintenance)
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {number} Number of cleaned up chats
     */
    cleanupInactiveChats(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        const cutoffTime = new Date(Date.now() - maxAge);
        const chatsToCleanup = this.chatRepository.findAll()
            .filter(chat => !chat.isActive && chat.endedAt < cutoffTime);

        chatsToCleanup.forEach(chat => {
            this.chatRepository.delete(chat.id);
        });

        return chatsToCleanup.length;
    }
}

module.exports = ChatController;
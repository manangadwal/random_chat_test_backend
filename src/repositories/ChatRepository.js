/**
 * Chat Repository
 * Handles data access operations for Chat entities
 */

const { activeChats, chatRooms } = require('../storage/memoryStorage');

class ChatRepository {
    constructor() {
        // Use memory storage maps
        this.chats = activeChats; // chatId -> Chat instance
        this.userChatMap = chatRooms; // userId -> chatId
    }

    /**
     * Save chat to storage
     * @param {Chat} chat - Chat instance to save
     * @returns {Chat} Saved chat instance
     */
    save(chat) {
        this.chats.set(chat.id, chat);

        // Update user-chat mapping
        this.userChatMap.set(chat.user1Id, chat.id);
        this.userChatMap.set(chat.user2Id, chat.id);

        return chat;
    }

    /**
     * Find chat by ID
     * @param {string} chatId - Chat ID
     * @returns {Chat|null} Chat instance or null if not found
     */
    findById(chatId) {
        return this.chats.get(chatId) || null;
    }

    /**
     * Find chat by participant
     * @param {string} userId - User ID
     * @param {boolean} activeOnly - Only return active chats (default: true)
     * @returns {Chat|null} Chat instance or null if not found
     */
    findByParticipant(userId, activeOnly = true) {
        const chatId = this.userChatMap.get(userId);
        if (!chatId) return null;

        const chat = this.findById(chatId);
        if (!chat) return null;

        if (activeOnly && !chat.isActive) return null;

        return chat;
    }

    /**
     * Find all chats
     * @param {boolean} activeOnly - Only return active chats (default: false)
     * @returns {Array} Array of all chats
     */
    findAll(activeOnly = false) {
        const allChats = Array.from(this.chats.values());

        if (activeOnly) {
            return allChats.filter(chat => chat.isActive);
        }

        return allChats;
    }

    /**
     * Find chats by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Array of matching chats
     */
    findByCriteria(criteria) {
        const allChats = this.findAll();

        return allChats.filter(chat => {
            // Filter by active status
            if (criteria.isActive !== undefined && chat.isActive !== criteria.isActive) {
                return false;
            }

            // Filter by participant
            if (criteria.participantId && !chat.hasParticipant(criteria.participantId)) {
                return false;
            }

            // Filter by date range
            if (criteria.startedAfter && chat.startedAt < criteria.startedAfter) {
                return false;
            }

            if (criteria.startedBefore && chat.startedAt > criteria.startedBefore) {
                return false;
            }

            // Filter by duration (for ended chats)
            if (criteria.minDuration && chat.getDuration() < criteria.minDuration) {
                return false;
            }

            if (criteria.maxDuration && chat.getDuration() > criteria.maxDuration) {
                return false;
            }

            // Filter by message count
            if (criteria.minMessages && chat.messages.length < criteria.minMessages) {
                return false;
            }

            return true;
        });
    }

    /**
     * Find active chats
     * @returns {Array} Array of active chats
     */
    findActiveChats() {
        return this.findByCriteria({ isActive: true });
    }

    /**
     * Find completed chats
     * @returns {Array} Array of completed chats
     */
    findCompletedChats() {
        return this.findByCriteria({ isActive: false });
    }

    /**
     * Find user's chat history
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of chats to return
     * @returns {Array} Array of user's chats
     */
    findUserChatHistory(userId, limit = 10) {
        const userChats = this.findByCriteria({ participantId: userId });

        // Sort by start time (most recent first)
        userChats.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

        return limit > 0 ? userChats.slice(0, limit) : userChats;
    }

    /**
     * Check if chat exists
     * @param {string} chatId - Chat ID
     * @returns {boolean} True if chat exists
     */
    exists(chatId) {
        return this.chats.has(chatId);
    }

    /**
     * Delete chat from storage
     * @param {string} chatId - Chat ID
     * @returns {boolean} True if deleted successfully
     */
    delete(chatId) {
        const chat = this.findById(chatId);
        if (!chat) return false;

        // Remove from user-chat mapping
        this.userChatMap.delete(chat.user1Id);
        this.userChatMap.delete(chat.user2Id);

        // Remove from chats
        return this.chats.delete(chatId);
    }

    /**
     * Get total chat count
     * @param {boolean} activeOnly - Only count active chats
     * @returns {number} Total number of chats
     */
    count(activeOnly = false) {
        if (activeOnly) {
            return this.findActiveChats().length;
        }
        return this.chats.size;
    }

    /**
     * Get chat count by criteria
     * @param {Object} criteria - Count criteria
     * @returns {number} Number of matching chats
     */
    countByCriteria(criteria) {
        return this.findByCriteria(criteria).length;
    }

    /**
     * Clear user from chat mapping (for cleanup)
     * @param {string} userId - User ID to clear
     * @returns {boolean} True if cleared
     */
    clearUserMapping(userId) {
        return this.userChatMap.delete(userId);
    }

    /**
     * Clear all chats (for testing/cleanup)
     * @returns {number} Number of chats cleared
     */
    clear() {
        const count = this.chats.size;
        this.chats.clear();
        this.userChatMap.clear();
        return count;
    }

    /**
     * Get chat statistics
     * @returns {Object} Chat statistics
     */
    getStats() {
        const allChats = this.findAll();
        const activeChats = this.findActiveChats();
        const completedChats = this.findCompletedChats();

        const totalMessages = allChats.reduce((sum, chat) => sum + chat.messages.length, 0);
        const avgDuration = completedChats.length > 0
            ? completedChats.reduce((sum, chat) => sum + chat.getDuration(), 0) / completedChats.length
            : 0;

        const avgMessages = allChats.length > 0
            ? totalMessages / allChats.length
            : 0;

        return {
            total: allChats.length,
            active: activeChats.length,
            completed: completedChats.length,
            totalMessages,
            averageMessages: Math.round(avgMessages * 100) / 100,
            averageDuration: Math.round(avgDuration / 1000), // in seconds
            longestChat: Math.max(...completedChats.map(chat => chat.getDuration()), 0),
            shortestChat: completedChats.length > 0 ? Math.min(...completedChats.map(chat => chat.getDuration())) : 0
        };
    }

    /**
     * Find chats that need cleanup (old inactive chats)
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {Array} Array of chats to cleanup
     */
    findChatsForCleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        const cutoffTime = new Date(Date.now() - maxAge);

        return this.findByCriteria({
            isActive: false,
            startedBefore: cutoffTime
        });
    }
}

module.exports = ChatRepository;
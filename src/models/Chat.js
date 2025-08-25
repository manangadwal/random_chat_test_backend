/**
 * Chat Model
 * Represents a one-on-one chat session between two users
 */

class Chat {
    constructor(user1Id, user2Id) {
        this.id = this.generateChatId();
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.startedAt = new Date();
        this.endedAt = null;
        this.isActive = true;
        this.messages = [];
    }

    /**
     * Generate unique chat ID
     * @returns {string} Unique chat ID
     */
    generateChatId() {
        return 'chat_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Add message to chat
     * @param {string} senderId - ID of message sender
     * @param {string} message - Message content
     * @param {Date} timestamp - Message timestamp
     */
    addMessage(senderId, message, timestamp = new Date()) {
        const messageData = {
            id: this.generateMessageId(),
            senderId,
            message,
            timestamp
        };
        this.messages.push(messageData);
        return messageData;
    }

    /**
     * Generate unique message ID
     * @returns {string} Unique message ID
     */
    generateMessageId() {
        return 'msg_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Get partner ID for a given user
     * @param {string} userId - User ID
     * @returns {string|null} Partner ID or null if user not in chat
     */
    getPartnerId(userId) {
        if (userId === this.user1Id) return this.user2Id;
        if (userId === this.user2Id) return this.user1Id;
        return null;
    }

    /**
     * Check if user is participant in this chat
     * @param {string} userId - User ID to check
     * @returns {boolean} True if user is participant
     */
    hasParticipant(userId) {
        return userId === this.user1Id || userId === this.user2Id;
    }

    /**
     * End the chat session
     */
    endChat() {
        this.isActive = false;
        this.endedAt = new Date();
    }

    /**
     * Get chat duration in milliseconds
     * @returns {number} Duration in milliseconds
     */
    getDuration() {
        const endTime = this.endedAt || new Date();
        return endTime.getTime() - this.startedAt.getTime();
    }

    /**
     * Get chat statistics
     * @returns {Object} Chat statistics
     */
    getStats() {
        return {
            id: this.id,
            participants: [this.user1Id, this.user2Id],
            startedAt: this.startedAt,
            endedAt: this.endedAt,
            duration: this.getDuration(),
            messageCount: this.messages.length,
            isActive: this.isActive
        };
    }

    /**
     * Serialize chat data
     * @returns {Object} Serialized chat data
     */
    toJSON() {
        return {
            id: this.id,
            user1Id: this.user1Id,
            user2Id: this.user2Id,
            startedAt: this.startedAt,
            endedAt: this.endedAt,
            isActive: this.isActive,
            messageCount: this.messages.length,
            duration: this.getDuration()
        };
    }
}

module.exports = Chat;
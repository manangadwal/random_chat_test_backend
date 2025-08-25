/**
 * Message Model
 * Represents a chat message with metadata
 */

class Message {
    constructor(senderId, content, chatId = null, groupId = null) {
        this.id = this.generateMessageId();
        this.senderId = senderId;
        this.content = content;
        this.originalContent = content; // Store original before filtering
        this.chatId = chatId;
        this.groupId = groupId;
        this.timestamp = new Date();
        this.isFiltered = false;
        this.filterReason = null;
        this.edited = false;
        this.editedAt = null;
    }

    /**
     * Generate unique message ID
     * @returns {string} Unique message ID
     */
    generateMessageId() {
        const prefix = this.groupId ? 'gmsg' : 'msg';
        return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Apply content filter to message
     * @param {string} filteredContent - Filtered content
     * @param {string} reason - Filter reason
     */
    applyFilter(filteredContent, reason = 'profanity') {
        if (this.content !== filteredContent) {
            this.content = filteredContent;
            this.isFiltered = true;
            this.filterReason = reason;
        }
    }

    /**
     * Edit message content
     * @param {string} newContent - New message content
     */
    edit(newContent) {
        this.content = newContent;
        this.edited = true;
        this.editedAt = new Date();
    }

    /**
     * Check if message is for group chat
     * @returns {boolean} True if group message
     */
    isGroupMessage() {
        return this.groupId !== null;
    }

    /**
     * Check if message is for one-on-one chat
     * @returns {boolean} True if private message
     */
    isPrivateMessage() {
        return this.chatId !== null && this.groupId === null;
    }

    /**
     * Get message age in milliseconds
     * @returns {number} Age in milliseconds
     */
    getAge() {
        return new Date().getTime() - this.timestamp.getTime();
    }

    /**
     * Check if message was sent recently (within specified minutes)
     * @param {number} minutes - Minutes threshold (default: 5)
     * @returns {boolean} True if recent
     */
    isRecent(minutes = 5) {
        const ageInMinutes = this.getAge() / (1000 * 60);
        return ageInMinutes <= minutes;
    }

    /**
     * Get message for display (with sender info)
     * @param {Object} senderInfo - Sender information
     * @returns {Object} Display message object
     */
    getDisplayMessage(senderInfo = {}) {
        return {
            id: this.id,
            senderId: this.senderId,
            senderName: senderInfo.name || 'Anonymous',
            senderNickname: senderInfo.nickname || null,
            content: this.content,
            timestamp: this.timestamp,
            isFiltered: this.isFiltered,
            edited: this.edited,
            editedAt: this.editedAt,
            chatId: this.chatId,
            groupId: this.groupId
        };
    }

    /**
     * Serialize message data
     * @returns {Object} Serialized message data
     */
    toJSON() {
        return {
            id: this.id,
            senderId: this.senderId,
            content: this.content,
            originalContent: this.originalContent,
            chatId: this.chatId,
            groupId: this.groupId,
            timestamp: this.timestamp,
            isFiltered: this.isFiltered,
            filterReason: this.filterReason,
            edited: this.edited,
            editedAt: this.editedAt
        };
    }
}

module.exports = Message;
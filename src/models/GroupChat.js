/**
 * GroupChat Model
 * Represents a group chat session with multiple users
 */

class GroupChat {
    constructor(maxMembers = 6) {
        this.id = this.generateGroupId();
        this.members = new Set();
        this.maxMembers = maxMembers;
        this.createdAt = new Date();
        this.isActive = true;
        this.messages = [];
        this.memberJoinHistory = [];
        this.memberLeaveHistory = [];
    }

    /**
     * Generate unique group ID
     * @returns {string} Unique group ID
     */
    generateGroupId() {
        return 'group_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Add member to group
     * @param {string} userId - User ID to add
     * @returns {boolean} True if added successfully
     */
    addMember(userId) {
        if (this.members.size >= this.maxMembers) {
            return false;
        }

        if (this.members.has(userId)) {
            return false; // Already a member
        }

        this.members.add(userId);
        this.memberJoinHistory.push({
            userId,
            joinedAt: new Date()
        });

        return true;
    }

    /**
     * Remove member from group
     * @param {string} userId - User ID to remove
     * @returns {boolean} True if removed successfully
     */
    removeMember(userId) {
        if (!this.members.has(userId)) {
            return false;
        }

        this.members.delete(userId);
        this.memberLeaveHistory.push({
            userId,
            leftAt: new Date()
        });

        // If no members left, mark group as inactive
        if (this.members.size === 0) {
            this.isActive = false;
        }

        return true;
    }

    /**
     * Check if group has space for new members
     * @returns {boolean} True if has space
     */
    hasSpace() {
        return this.members.size < this.maxMembers;
    }

    /**
     * Check if user is member of this group
     * @param {string} userId - User ID to check
     * @returns {boolean} True if user is member
     */
    hasMember(userId) {
        return this.members.has(userId);
    }

    /**
     * Get current member count
     * @returns {number} Number of current members
     */
    getMemberCount() {
        return this.members.size;
    }

    /**
     * Get all member IDs as array
     * @returns {Array} Array of member IDs
     */
    getMemberIds() {
        return Array.from(this.members);
    }

    /**
     * Add message to group chat
     * @param {string} senderId - ID of message sender
     * @param {string} message - Message content
     * @param {Date} timestamp - Message timestamp
     * @returns {Object} Message data
     */
    addMessage(senderId, message, timestamp = new Date()) {
        if (!this.hasMember(senderId)) {
            throw new Error('User is not a member of this group');
        }

        const messageData = {
            id: this.generateMessageId(),
            senderId,
            message,
            timestamp,
            groupId: this.id
        };

        this.messages.push(messageData);
        return messageData;
    }

    /**
     * Generate unique message ID
     * @returns {string} Unique message ID
     */
    generateMessageId() {
        return 'gmsg_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Get group statistics
     * @returns {Object} Group statistics
     */
    getStats() {
        return {
            id: this.id,
            memberCount: this.members.size,
            maxMembers: this.maxMembers,
            messageCount: this.messages.length,
            createdAt: this.createdAt,
            isActive: this.isActive,
            totalJoins: this.memberJoinHistory.length,
            totalLeaves: this.memberLeaveHistory.length
        };
    }

    /**
     * Get group info for members
     * @returns {Object} Group info
     */
    getGroupInfo() {
        return {
            id: this.id,
            memberCount: this.members.size,
            maxMembers: this.maxMembers,
            hasSpace: this.hasSpace(),
            createdAt: this.createdAt
        };
    }

    /**
     * Serialize group data
     * @returns {Object} Serialized group data
     */
    toJSON() {
        return {
            id: this.id,
            members: Array.from(this.members),
            memberCount: this.members.size,
            maxMembers: this.maxMembers,
            createdAt: this.createdAt,
            isActive: this.isActive,
            messageCount: this.messages.length
        };
    }
}

module.exports = GroupChat;
/**
 * Group Chat Controller
 * Handles group chat operations and business logic
 */

const GroupChat = require('../models/GroupChat');
const Message = require('../models/Message');
const GroupChatRepository = require('../repositories/GroupChatRepository');
const UserController = require('./UserController');
const ProfanityFilter = require('../filters/profanityFilter');

class GroupChatController {
    constructor(io) {
        this.io = io;
        this.groupChatRepository = new GroupChatRepository();
        this.userController = new UserController();
        this.profanityFilter = new ProfanityFilter();
        this.maxGroupSize = 6;
    }

    /**
     * Join user to a group chat
     * @param {string} userId - User ID to join
     * @returns {Object} Join result
     */
    joinGroupChat(userId) {
        try {
            const user = this.userController.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.isInChat) {
                throw new Error('Cannot join group while in 1-on-1 chat');
            }

            if (user.isInGroup) {
                // Leave current group first
                this.leaveGroupChat(userId);
            }

            // Find available group or create new one
            let group = this.findAvailableGroup();
            if (!group) {
                group = this.createNewGroup();
            }

            // Add user to group
            const added = group.addMember(userId);
            if (!added) {
                throw new Error('Failed to join group');
            }

            // Update user status
            this.userController.setUserGroupStatus(userId, true);

            // Save group
            this.groupChatRepository.save(group);

            // Join socket room
            const userSocket = this.io.sockets.sockets.get(userId);
            if (userSocket) {
                userSocket.join(group.id);
            }

            // Get user info for announcement
            const userInfo = this.userController.getUserPartnerInfo(userId);

            // Notify group about new member
            this.io.to(group.id).emit('userJoinedGroup', {
                groupId: group.id,
                userId: userId,
                userInfo: userInfo,
                memberCount: group.getMemberCount(),
                timestamp: new Date()
            });

            // Send group info to new member
            if (userSocket) {
                userSocket.emit('groupJoined', {
                    groupId: group.id,
                    memberCount: group.getMemberCount(),
                    maxMembers: group.maxMembers,
                    groupInfo: group.getGroupInfo()
                });
            }

            console.log(`User ${userId} joined group ${group.id} (${group.getMemberCount()}/${group.maxMembers})`);

            return {
                success: true,
                groupId: group.id,
                memberCount: group.getMemberCount(),
                maxMembers: group.maxMembers
            };

        } catch (error) {
            console.error('Error joining group chat:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove user from group chat
     * @param {string} userId - User ID to remove
     * @returns {Object} Leave result
     */
    leaveGroupChat(userId) {
        try {
            const group = this.groupChatRepository.findByMember(userId);
            if (!group) {
                return { success: true, message: 'User not in any group' };
            }

            // Remove user from group
            const removed = group.removeMember(userId);
            if (!removed) {
                throw new Error('Failed to leave group');
            }

            // Update user status
            this.userController.setUserGroupStatus(userId, false);

            // Leave socket room
            const userSocket = this.io.sockets.sockets.get(userId);
            if (userSocket) {
                userSocket.leave(group.id);
                userSocket.emit('groupLeft', {
                    groupId: group.id,
                    timestamp: new Date()
                });
            }

            // Get user info for announcement
            const userInfo = this.userController.getUserPartnerInfo(userId);

            // Notify remaining group members
            if (group.getMemberCount() > 0) {
                this.io.to(group.id).emit('userLeftGroup', {
                    groupId: group.id,
                    userId: userId,
                    userInfo: userInfo,
                    memberCount: group.getMemberCount(),
                    timestamp: new Date()
                });

                // Save updated group
                this.groupChatRepository.save(group);
            } else {
                // Delete empty group
                this.groupChatRepository.delete(group.id);
                console.log(`Empty group ${group.id} deleted`);
            }

            console.log(`User ${userId} left group ${group.id}`);

            return {
                success: true,
                groupId: group.id,
                memberCount: group.getMemberCount()
            };

        } catch (error) {
            console.error('Error leaving group chat:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send message in group chat
     * @param {string} senderId - Message sender ID
     * @param {string} messageContent - Message content
     * @returns {Object} Send result
     */
    sendGroupMessage(senderId, messageContent) {
        try {
            const group = this.groupChatRepository.findByMember(senderId);
            if (!group) {
                throw new Error('User not in any group chat');
            }

            // Create message
            const message = new Message(senderId, messageContent, null, group.id);

            // Apply profanity filter
            const filteredContent = this.profanityFilter.filterMessage(messageContent);
            if (filteredContent !== messageContent) {
                message.applyFilter(filteredContent, 'profanity');
                console.log(`Profanity filtered in group ${group.id} from ${senderId}: "${messageContent}" -> "${filteredContent}"`);
            }

            // Add message to group
            const messageData = group.addMessage(senderId, message.content, message.timestamp);
            this.groupChatRepository.save(group);

            // Get sender info for display
            const senderInfo = this.userController.getUserPartnerInfo(senderId);

            // Send to group (excluding sender)
            const senderSocket = this.io.sockets.sockets.get(senderId);
            if (senderSocket) {
                senderSocket.to(group.id).emit('groupMessageReceived', {
                    ...message.getDisplayMessage(senderInfo),
                    groupId: group.id,
                    memberCount: group.getMemberCount()
                });
            }

            console.log(`Group message in ${group.id}: ${message.content}`);

            return {
                success: true,
                messageId: message.id,
                groupId: group.id,
                filtered: message.isFiltered
            };

        } catch (error) {
            console.error('Error sending group message:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find available group with space
     * @returns {GroupChat|null} Available group or null
     */
    findAvailableGroup() {
        const groups = this.groupChatRepository.findAll();
        return groups.find(group => group.isActive && group.hasSpace()) || null;
    }

    /**
     * Create new group chat
     * @returns {GroupChat} New group instance
     */
    createNewGroup() {
        const group = new GroupChat(this.maxGroupSize);
        this.groupChatRepository.save(group);
        console.log(`New group created: ${group.id}`);
        return group;
    }

    /**
     * Get group statistics
     * @returns {Object} Group statistics
     */
    getGroupStats() {
        const groups = this.groupChatRepository.findAll();
        const activeGroups = groups.filter(group => group.isActive);

        const totalMembers = activeGroups.reduce((sum, group) => sum + group.getMemberCount(), 0);
        const totalMessages = groups.reduce((sum, group) => sum + group.messages.length, 0);

        const groupSizes = activeGroups.map(group => group.getMemberCount());
        const avgGroupSize = groupSizes.length > 0
            ? groupSizes.reduce((sum, size) => sum + size, 0) / groupSizes.length
            : 0;

        return {
            totalGroups: groups.length,
            activeGroups: activeGroups.length,
            totalMembers,
            totalMessages,
            averageGroupSize: Math.round(avgGroupSize * 100) / 100,
            maxGroupSize: this.maxGroupSize,
            availableSlots: activeGroups.reduce((sum, group) => sum + (group.maxMembers - group.getMemberCount()), 0)
        };
    }

    /**
     * Get group info by ID
     * @param {string} groupId - Group ID
     * @returns {Object|null} Group info or null
     */
    getGroupInfo(groupId) {
        const group = this.groupChatRepository.findById(groupId);
        return group ? group.getGroupInfo() : null;
    }

    /**
     * Get user's current group
     * @param {string} userId - User ID
     * @returns {GroupChat|null} User's group or null
     */
    getUserGroup(userId) {
        return this.groupChatRepository.findByMember(userId);
    }

    /**
     * Clean up empty groups (for maintenance)
     * @returns {number} Number of cleaned up groups
     */
    cleanupEmptyGroups() {
        const groups = this.groupChatRepository.findAll();
        const emptyGroups = groups.filter(group => group.getMemberCount() === 0);

        emptyGroups.forEach(group => {
            this.groupChatRepository.delete(group.id);
        });

        console.log(`Cleaned up ${emptyGroups.length} empty groups`);
        return emptyGroups.length;
    }

    /**
     * Force remove user from all groups (for cleanup)
     * @param {string} userId - User ID to remove
     * @returns {boolean} True if removed from any group
     */
    forceRemoveUserFromGroups(userId) {
        const group = this.groupChatRepository.findByMember(userId);
        if (group) {
            this.leaveGroupChat(userId);
            return true;
        }
        return false;
    }
}

module.exports = GroupChatController;
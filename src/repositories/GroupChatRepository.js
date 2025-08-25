/**
 * Group Chat Repository
 * Handles data access operations for GroupChat entities
 */

const { groupChats } = require('../storage/memoryStorage');

class GroupChatRepository {
    constructor() {
        // Use memory storage map
        this.groups = groupChats; // groupId -> GroupChat instance
    }

    /**
     * Save group chat to storage
     * @param {GroupChat} group - GroupChat instance to save
     * @returns {GroupChat} Saved group instance
     */
    save(group) {
        this.groups.set(group.id, group);
        return group;
    }

    /**
     * Find group by ID
     * @param {string} groupId - Group ID
     * @returns {GroupChat|null} GroupChat instance or null if not found
     */
    findById(groupId) {
        return this.groups.get(groupId) || null;
    }

    /**
     * Find group by member
     * @param {string} userId - User ID
     * @returns {GroupChat|null} GroupChat instance or null if not found
     */
    findByMember(userId) {
        for (const group of this.groups.values()) {
            if (group.hasMember(userId)) {
                return group;
            }
        }
        return null;
    }

    /**
     * Find all groups
     * @param {boolean} activeOnly - Only return active groups (default: false)
     * @returns {Array} Array of all groups
     */
    findAll(activeOnly = false) {
        const allGroups = Array.from(this.groups.values());

        if (activeOnly) {
            return allGroups.filter(group => group.isActive);
        }

        return allGroups;
    }

    /**
     * Find groups by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Array of matching groups
     */
    findByCriteria(criteria) {
        const allGroups = this.findAll();

        return allGroups.filter(group => {
            // Filter by active status
            if (criteria.isActive !== undefined && group.isActive !== criteria.isActive) {
                return false;
            }

            // Filter by member count
            if (criteria.minMembers && group.getMemberCount() < criteria.minMembers) {
                return false;
            }

            if (criteria.maxMembers && group.getMemberCount() > criteria.maxMembers) {
                return false;
            }

            // Filter by availability (has space)
            if (criteria.hasSpace !== undefined && group.hasSpace() !== criteria.hasSpace) {
                return false;
            }

            // Filter by date range
            if (criteria.createdAfter && group.createdAt < criteria.createdAfter) {
                return false;
            }

            if (criteria.createdBefore && group.createdAt > criteria.createdBefore) {
                return false;
            }

            // Filter by message count
            if (criteria.minMessages && group.messages.length < criteria.minMessages) {
                return false;
            }

            return true;
        });
    }

    /**
     * Find active groups
     * @returns {Array} Array of active groups
     */
    findActiveGroups() {
        return this.findByCriteria({ isActive: true });
    }

    /**
     * Find groups with available space
     * @returns {Array} Array of groups with space
     */
    findAvailableGroups() {
        return this.findByCriteria({
            isActive: true,
            hasSpace: true
        });
    }

    /**
     * Find empty groups
     * @returns {Array} Array of empty groups
     */
    findEmptyGroups() {
        return this.findByCriteria({ maxMembers: 0 });
    }

    /**
     * Find full groups
     * @returns {Array} Array of full groups
     */
    findFullGroups() {
        return this.findByCriteria({ hasSpace: false });
    }

    /**
     * Check if group exists
     * @param {string} groupId - Group ID
     * @returns {boolean} True if group exists
     */
    exists(groupId) {
        return this.groups.has(groupId);
    }

    /**
     * Delete group from storage
     * @param {string} groupId - Group ID
     * @returns {boolean} True if deleted successfully
     */
    delete(groupId) {
        return this.groups.delete(groupId);
    }

    /**
     * Get total group count
     * @param {boolean} activeOnly - Only count active groups
     * @returns {number} Total number of groups
     */
    count(activeOnly = false) {
        if (activeOnly) {
            return this.findActiveGroups().length;
        }
        return this.groups.size;
    }

    /**
     * Get group count by criteria
     * @param {Object} criteria - Count criteria
     * @returns {number} Number of matching groups
     */
    countByCriteria(criteria) {
        return this.findByCriteria(criteria).length;
    }

    /**
     * Get total member count across all groups
     * @param {boolean} activeOnly - Only count members in active groups
     * @returns {number} Total number of members
     */
    getTotalMemberCount(activeOnly = true) {
        const groups = activeOnly ? this.findActiveGroups() : this.findAll();
        return groups.reduce((sum, group) => sum + group.getMemberCount(), 0);
    }

    /**
     * Clear all groups (for testing/cleanup)
     * @returns {number} Number of groups cleared
     */
    clear() {
        const count = this.groups.size;
        this.groups.clear();
        return count;
    }

    /**
     * Remove user from all groups (for cleanup)
     * @param {string} userId - User ID to remove
     * @returns {Array} Array of group IDs user was removed from
     */
    removeUserFromAllGroups(userId) {
        const removedFrom = [];

        for (const group of this.groups.values()) {
            if (group.hasMember(userId)) {
                group.removeMember(userId);
                removedFrom.push(group.id);

                // Delete group if empty
                if (group.getMemberCount() === 0) {
                    this.delete(group.id);
                } else {
                    this.save(group);
                }
            }
        }

        return removedFrom;
    }

    /**
     * Get group statistics
     * @returns {Object} Group statistics
     */
    getStats() {
        const allGroups = this.findAll();
        const activeGroups = this.findActiveGroups();
        const availableGroups = this.findAvailableGroups();
        const emptyGroups = this.findEmptyGroups();
        const fullGroups = this.findFullGroups();

        const totalMembers = this.getTotalMemberCount(true);
        const totalMessages = allGroups.reduce((sum, group) => sum + group.messages.length, 0);

        const memberCounts = activeGroups.map(group => group.getMemberCount());
        const avgGroupSize = memberCounts.length > 0
            ? memberCounts.reduce((sum, count) => sum + count, 0) / memberCounts.length
            : 0;

        const avgMessages = allGroups.length > 0
            ? totalMessages / allGroups.length
            : 0;

        return {
            total: allGroups.length,
            active: activeGroups.length,
            available: availableGroups.length,
            empty: emptyGroups.length,
            full: fullGroups.length,
            totalMembers,
            totalMessages,
            averageGroupSize: Math.round(avgGroupSize * 100) / 100,
            averageMessages: Math.round(avgMessages * 100) / 100,
            largestGroup: Math.max(...memberCounts, 0),
            smallestActiveGroup: activeGroups.length > 0 ? Math.min(...memberCounts.filter(count => count > 0)) : 0,
            availableSlots: activeGroups.reduce((sum, group) => sum + (group.maxMembers - group.getMemberCount()), 0)
        };
    }

    /**
     * Find groups that need cleanup (empty inactive groups)
     * @param {number} maxAge - Maximum age in milliseconds for empty groups
     * @returns {Array} Array of groups to cleanup
     */
    findGroupsForCleanup(maxAge = 60 * 60 * 1000) { // 1 hour default
        const cutoffTime = new Date(Date.now() - maxAge);

        return this.findByCriteria({
            maxMembers: 0, // empty groups
            createdBefore: cutoffTime
        });
    }

    /**
     * Get group activity summary
     * @param {number} hours - Hours to look back (default: 24)
     * @returns {Object} Activity summary
     */
    getActivitySummary(hours = 24) {
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        const recentGroups = this.findByCriteria({ createdAfter: cutoffTime });

        const recentMessages = recentGroups.reduce((sum, group) => {
            return sum + group.messages.filter(msg => msg.timestamp >= cutoffTime).length;
        }, 0);

        return {
            groupsCreated: recentGroups.length,
            messagesInPeriod: recentMessages,
            activeGroupsInPeriod: recentGroups.filter(group => group.isActive).length,
            periodHours: hours
        };
    }
}

module.exports = GroupChatRepository;
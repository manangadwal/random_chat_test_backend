/**
 * User Repository
 * Handles data access operations for User entities
 */

const { users } = require('../storage/memoryStorage');

class UserRepository {
    /**
     * Save user to storage
     * @param {User} user - User instance to save
     * @returns {User} Saved user instance
     */
    save(user) {
        users.set(user.socketId, user);
        return user;
    }

    /**
     * Find user by socket ID
     * @param {string} socketId - Socket connection ID
     * @returns {User|null} User instance or null if not found
     */
    findById(socketId) {
        return users.get(socketId) || null;
    }

    /**
     * Find all users
     * @returns {Array} Array of all users
     */
    findAll() {
        return Array.from(users.values());
    }

    /**
     * Find users by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Array of matching users
     */
    findByCriteria(criteria) {
        const allUsers = this.findAll();

        return allUsers.filter(user => {
            // Filter by chat status
            if (criteria.isInChat !== undefined && user.isInChat !== criteria.isInChat) {
                return false;
            }

            // Filter by group status
            if (criteria.isInGroup !== undefined && user.isInGroup !== criteria.isInGroup) {
                return false;
            }

            // Filter by profile completion
            if (criteria.profileComplete !== undefined && user.isProfileComplete() !== criteria.profileComplete) {
                return false;
            }

            // Filter by gender
            if (criteria.gender && user.profile.gender !== criteria.gender) {
                return false;
            }

            // Filter by gender preference
            if (criteria.preferredGender && user.preferences.preferredGender !== criteria.preferredGender) {
                return false;
            }

            return true;
        });
    }

    /**
     * Find available users (not in chat or group)
     * @returns {Array} Array of available users
     */
    findAvailableUsers() {
        return this.findByCriteria({
            isInChat: false,
            isInGroup: false
        });
    }

    /**
     * Find users in chat
     * @returns {Array} Array of users currently in chat
     */
    findUsersInChat() {
        return this.findByCriteria({ isInChat: true });
    }

    /**
     * Find users in group
     * @returns {Array} Array of users currently in group
     */
    findUsersInGroup() {
        return this.findByCriteria({ isInGroup: true });
    }

    /**
     * Find users with completed profiles
     * @returns {Array} Array of users with completed profiles
     */
    findUsersWithCompletedProfiles() {
        return this.findByCriteria({ profileComplete: true });
    }

    /**
     * Check if user exists
     * @param {string} socketId - Socket connection ID
     * @returns {boolean} True if user exists
     */
    exists(socketId) {
        return users.has(socketId);
    }

    /**
     * Delete user from storage
     * @param {string} socketId - Socket connection ID
     * @returns {boolean} True if deleted successfully
     */
    delete(socketId) {
        return users.delete(socketId);
    }

    /**
     * Get total user count
     * @returns {number} Total number of users
     */
    count() {
        return users.size;
    }

    /**
     * Get user count by criteria
     * @param {Object} criteria - Count criteria
     * @returns {number} Number of matching users
     */
    countByCriteria(criteria) {
        return this.findByCriteria(criteria).length;
    }

    /**
     * Update user in storage
     * @param {string} socketId - Socket connection ID
     * @param {Object} updates - Updates to apply
     * @returns {User|null} Updated user or null if not found
     */
    update(socketId, updates) {
        const user = this.findById(socketId);
        if (!user) return null;

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (user.hasOwnProperty(key)) {
                user[key] = updates[key];
            }
        });

        return this.save(user);
    }

    /**
     * Clear all users (for testing/cleanup)
     * @returns {number} Number of users cleared
     */
    clear() {
        const count = users.size;
        users.clear();
        return count;
    }

    /**
     * Get users connected within time period
     * @param {number} minutes - Minutes ago
     * @returns {Array} Array of recently connected users
     */
    findRecentlyConnected(minutes = 5) {
        const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
        return this.findAll().filter(user => user.connectedAt >= cutoffTime);
    }

    /**
     * Get user statistics
     * @returns {Object} User statistics
     */
    getStats() {
        const allUsers = this.findAll();

        return {
            total: allUsers.length,
            inChat: this.countByCriteria({ isInChat: true }),
            inGroup: this.countByCriteria({ isInGroup: true }),
            available: this.countByCriteria({ isInChat: false, isInGroup: false }),
            completedProfiles: this.countByCriteria({ profileComplete: true }),
            recentlyConnected: this.findRecentlyConnected().length
        };
    }
}

module.exports = UserRepository;
/**
 * User matching service for finding compatible chat partners
 * Handles gender preferences and compatibility logic
 */

const { users, waitingUsers, userProfiles } = require('../storage/memoryStorage');

class MatchingService {
    /**
     * Find a compatible partner for the given user
     * @param {string} userId - Socket ID of user looking for match
     * @returns {string|null} Socket ID of compatible partner or null
     */
    static findCompatiblePartner(userId) {
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

            // Check if users are gender compatible
            if (this.isGenderCompatible(userProfile, userPreferences, waitingProfile, waitingPreferences)) {
                return waitingUserId;
            }
        }

        return null;
    }

    /**
     * Check if two users are compatible based on gender preferences
     * @param {Object} userProfile - First user's profile
     * @param {Object} userPrefs - First user's preferences
     * @param {Object} partnerProfile - Second user's profile
     * @param {Object} partnerPrefs - Second user's preferences
     * @returns {boolean} True if compatible, false otherwise
     */
    static isGenderCompatible(userProfile, userPrefs, partnerProfile, partnerPrefs) {
        const userGender = userProfile?.gender;
        const partnerGender = partnerProfile?.gender;
        const userPrefGender = userPrefs?.preferredGender || 'any';
        const partnerPrefGender = partnerPrefs?.preferredGender || 'any';

        // If either user has no gender preference, match is possible
        if (userPrefGender === 'any' || partnerPrefGender === 'any') {
            return true;
        }

        // If profiles are incomplete, allow matching
        if (!userGender || !partnerGender) {
            return true;
        }

        // Check mutual compatibility - both users' preferences must be satisfied
        const userSatisfied = userPrefGender === 'any' || userPrefGender === partnerGender;
        const partnerSatisfied = partnerPrefGender === 'any' || partnerPrefGender === userGender;

        return userSatisfied && partnerSatisfied;
    }

    /**
     * Add user to waiting list for matching
     * @param {string} socketId - Socket ID of user
     * @param {Object} preferences - User's matching preferences
     */
    static addToWaitingList(socketId, preferences = {}) {
        waitingUsers.set(socketId, {
            userId: socketId,
            preferences: preferences,
            joinedAt: new Date()
        });
    }

    /**
     * Remove user from waiting list
     * @param {string} socketId - Socket ID of user to remove
     */
    static removeFromWaitingList(socketId) {
        waitingUsers.delete(socketId);
    }
}

module.exports = MatchingService;
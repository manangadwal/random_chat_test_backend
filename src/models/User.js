/**
 * User Model
 * Represents a user entity with profile and preferences
 */

class User {
    constructor(socketId) {
        this.id = socketId;
        this.socketId = socketId;
        this.connectedAt = new Date();
        this.isInChat = false;
        this.isInGroup = false;
        this.profileSetup = false;
        this.preferences = {
            preferredGender: 'any'
        };
        this.profile = {
            name: null,
            gender: null,
            avatar: null,
            nickname: null,
            isProfileComplete: false
        };
    }

    /**
     * Update user profile
     * @param {Object} profileData - New profile data
     * @returns {Object} Updated profile
     */
    updateProfile(profileData) {
        this.profile = {
            name: profileData.name !== undefined ? profileData.name : this.profile.name,
            gender: profileData.gender !== undefined ? profileData.gender : this.profile.gender,
            avatar: profileData.avatar !== undefined ? profileData.avatar : this.profile.avatar,
            nickname: profileData.nickname !== undefined ? profileData.nickname : this.profile.nickname,
            isProfileComplete: true
        };
        this.profileSetup = true;
        return this.profile;
    }

    /**
     * Update user preferences
     * @param {Object} preferences - New preferences
     * @returns {Object} Updated preferences
     */
    updatePreferences(preferences) {
        this.preferences = { ...this.preferences, ...preferences };
        return this.preferences;
    }

    /**
     * Set user chat status
     * @param {boolean} inChat - Whether user is in chat
     */
    setInChat(inChat) {
        this.isInChat = inChat;
    }

    /**
     * Set user group status
     * @param {boolean} inGroup - Whether user is in group
     */
    setInGroup(inGroup) {
        this.isInGroup = inGroup;
    }

    /**
     * Get user display name
     * @returns {string} Display name
     */
    getDisplayName() {
        return this.profile.nickname || this.profile.name || 'Anonymous';
    }

    /**
     * Check if profile is complete
     * @returns {boolean} True if profile is complete
     */
    isProfileComplete() {
        return this.profile.isProfileComplete;
    }

    /**
     * Get user info for partner display
     * @returns {Object} Partner info object
     */
    getPartnerInfo() {
        return {
            name: this.getDisplayName(),
            avatar: this.profile.avatar || null,
            gender: this.profile.gender || null,
            nickname: this.profile.nickname || null
        };
    }

    /**
     * Serialize user data
     * @returns {Object} Serialized user data
     */
    toJSON() {
        return {
            id: this.id,
            socketId: this.socketId,
            connectedAt: this.connectedAt,
            isInChat: this.isInChat,
            isInGroup: this.isInGroup,
            profileSetup: this.profileSetup,
            preferences: this.preferences,
            profile: this.profile
        };
    }
}

module.exports = User;
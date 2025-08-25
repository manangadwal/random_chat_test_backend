/**
 * User Controller
 * Handles user-related operations and business logic
 */

const User = require('../models/User');
const UserRepository = require('../repositories/UserRepository');
const { isValidGender, isValidPreference, sanitizeInput } = require('../utils/helpers');

class UserController {
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Create a new user
     * @param {string} socketId - Socket connection ID
     * @returns {User} Created user instance
     */
    createUser(socketId) {
        const user = new User(socketId);
        this.userRepository.save(user);
        return user;
    }

    /**
     * Get user by socket ID
     * @param {string} socketId - Socket connection ID
     * @returns {User|null} User instance or null if not found
     */
    getUser(socketId) {
        return this.userRepository.findById(socketId);
    }

    /**
     * Update user profile
     * @param {string} socketId - Socket connection ID
     * @param {Object} profileData - Profile data to update
     * @returns {Object} Updated profile or null if user not found
     */
    updateUserProfile(socketId, profileData) {
        const user = this.userRepository.findById(socketId);
        if (!user) return null;

        // Sanitize input data
        const sanitizedData = {
            name: profileData.name ? sanitizeInput(profileData.name.trim()) : undefined,
            gender: profileData.gender && isValidGender(profileData.gender) ? profileData.gender : undefined,
            avatar: profileData.avatar ? sanitizeInput(profileData.avatar) : undefined,
            nickname: profileData.nickname ? sanitizeInput(profileData.nickname.trim()) : undefined
        };

        // Remove undefined values
        Object.keys(sanitizedData).forEach(key => {
            if (sanitizedData[key] === undefined) {
                delete sanitizedData[key];
            }
        });

        const updatedProfile = user.updateProfile(sanitizedData);
        this.userRepository.save(user);

        return updatedProfile;
    }

    /**
     * Update user preferences
     * @param {string} socketId - Socket connection ID
     * @param {Object} preferences - Preferences to update
     * @returns {Object} Updated preferences or null if user not found
     */
    updateUserPreferences(socketId, preferences) {
        const user = this.userRepository.findById(socketId);
        if (!user) return null;

        // Validate preferences
        const validatedPreferences = {};
        if (preferences.preferredGender && isValidPreference(preferences.preferredGender)) {
            validatedPreferences.preferredGender = preferences.preferredGender;
        }

        const updatedPreferences = user.updatePreferences(validatedPreferences);
        this.userRepository.save(user);

        return updatedPreferences;
    }

    /**
     * Set user chat status
     * @param {string} socketId - Socket connection ID
     * @param {boolean} inChat - Whether user is in chat
     * @returns {boolean} True if updated successfully
     */
    setUserChatStatus(socketId, inChat) {
        const user = this.userRepository.findById(socketId);
        if (!user) return false;

        user.setInChat(inChat);
        this.userRepository.save(user);
        return true;
    }

    /**
     * Set user group status
     * @param {string} socketId - Socket connection ID
     * @param {boolean} inGroup - Whether user is in group
     * @returns {boolean} True if updated successfully
     */
    setUserGroupStatus(socketId, inGroup) {
        const user = this.userRepository.findById(socketId);
        if (!user) return false;

        user.setInGroup(inGroup);
        this.userRepository.save(user);
        return true;
    }

    /**
     * Get user profile data
     * @param {string} socketId - Socket connection ID
     * @returns {Object|null} Profile and preferences data
     */
    getUserProfileData(socketId) {
        const user = this.userRepository.findById(socketId);
        if (!user) return null;

        return {
            profile: user.profile,
            preferences: user.preferences
        };
    }

    /**
     * Get user partner info
     * @param {string} socketId - Socket connection ID
     * @returns {Object|null} Partner info or null if user not found
     */
    getUserPartnerInfo(socketId) {
        const user = this.userRepository.findById(socketId);
        if (!user) return null;

        return user.getPartnerInfo();
    }

    /**
     * Get all active users count
     * @returns {number} Number of active users
     */
    getActiveUsersCount() {
        return this.userRepository.count();
    }

    /**
     * Get users by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Array of matching users
     */
    getUsersByCriteria(criteria) {
        return this.userRepository.findByCriteria(criteria);
    }

    /**
     * Delete user
     * @param {string} socketId - Socket connection ID
     * @returns {boolean} True if deleted successfully
     */
    deleteUser(socketId) {
        return this.userRepository.delete(socketId);
    }

    /**
     * Get user statistics
     * @returns {Object} User statistics
     */
    getUserStats() {
        const allUsers = this.userRepository.findAll();
        const completedProfiles = allUsers.filter(user => user.isProfileComplete()).length;
        const usersInChat = allUsers.filter(user => user.isInChat).length;
        const usersInGroup = allUsers.filter(user => user.isInGroup).length;

        return {
            total: allUsers.length,
            completedProfiles,
            usersInChat,
            usersInGroup,
            availableUsers: allUsers.length - usersInChat - usersInGroup
        };
    }

    /**
     * Validate user data
     * @param {Object} userData - User data to validate
     * @returns {Object} Validation result
     */
    validateUserData(userData) {
        const errors = [];

        if (userData.name && userData.name.length > 50) {
            errors.push('Name must be 50 characters or less');
        }

        if (userData.nickname && userData.nickname.length > 30) {
            errors.push('Nickname must be 30 characters or less');
        }

        if (userData.gender && !isValidGender(userData.gender)) {
            errors.push('Invalid gender value');
        }

        if (userData.preferredGender && !isValidPreference(userData.preferredGender)) {
            errors.push('Invalid gender preference');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = UserController;
/**
 * In-memory storage for user data, chat sessions, and profiles
 * This module centralizes all data storage operations
 */

// Core user data storage
const users = new Map(); // socketId -> user info with profile
const waitingUsers = new Map(); // socketId -> user preferences for matching
const activeChats = new Map(); // chatId -> {user1, user2}
const chatRooms = new Map(); // socketId -> chatId
const userProfiles = new Map(); // socketId -> profile data

/**
 * Initialize a new user in storage
 * @param {string} socketId - Socket connection ID
 */
function initializeUser(socketId) {
    // Store basic user info
    users.set(socketId, {
        id: socketId,
        connectedAt: new Date(),
        isInChat: false,
        preferences: { preferredGender: 'any' }
    });

    // Initialize empty profile
    userProfiles.set(socketId, {
        name: null,
        gender: null,
        avatar: null,
        isProfileComplete: false
    });
}

/**
 * Clean up all user data on disconnect
 * @param {string} socketId - Socket connection ID
 */
function cleanupUser(socketId) {
    waitingUsers.delete(socketId);
    users.delete(socketId);
    userProfiles.delete(socketId);
    chatRooms.delete(socketId);
}

/**
 * Get user data by socket ID
 * @param {string} socketId - Socket connection ID
 * @returns {Object|null} User data or null if not found
 */
function getUser(socketId) {
    return users.get(socketId);
}

/**
 * Get user profile by socket ID
 * @param {string} socketId - Socket connection ID
 * @returns {Object|null} User profile or null if not found
 */
function getUserProfile(socketId) {
    return userProfiles.get(socketId);
}

/**
 * Update user profile data
 * @param {string} socketId - Socket connection ID
 * @param {Object} profileData - New profile data
 */
function updateUserProfile(socketId, profileData) {
    const currentProfile = userProfiles.get(socketId);
    if (!currentProfile) return false;

    const updatedProfile = {
        name: profileData.name !== undefined ? profileData.name : currentProfile.name,
        gender: profileData.gender !== undefined ? profileData.gender : currentProfile.gender,
        avatar: profileData.avatar !== undefined ? profileData.avatar : currentProfile.avatar,
        isProfileComplete: true
    };

    userProfiles.set(socketId, updatedProfile);
    return updatedProfile;
}

/**
 * Update user preferences
 * @param {string} socketId - Socket connection ID
 * @param {Object} preferences - New preferences
 */
function updateUserPreferences(socketId, preferences) {
    const user = users.get(socketId);
    if (!user) return false;

    user.preferences = { ...user.preferences, ...preferences };
    return user.preferences;
}

module.exports = {
    // Storage maps
    users,
    waitingUsers,
    activeChats,
    chatRooms,
    userProfiles,

    // Helper functions
    initializeUser,
    cleanupUser,
    getUser,
    getUserProfile,
    updateUserProfile,
    updateUserPreferences
};
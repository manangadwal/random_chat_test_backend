/**
 * In-memory storage for user data, chat sessions, and profiles
 * This module centralizes all data storage operations for MVC architecture
 */

// Core data storage maps
const users = new Map(); // socketId -> User instance
const waitingUsers = new Map(); // socketId -> user preferences for matching
const activeChats = new Map(); // chatId -> Chat instance
const chatRooms = new Map(); // socketId -> chatId (for backward compatibility)
const userProfiles = new Map(); // socketId -> profile data (for backward compatibility)
const groupChats = new Map(); // groupId -> GroupChat instance

// Legacy group storage (for backward compatibility)
const groupRooms = new Map(); // socketId -> groupId
const waitingForGroup = new Map(); // socketId -> {joinedAt: Date, preferences: {}}

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
        isInGroup: false,
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
    waitingForGroup.delete(socketId);
    users.delete(socketId);
    userProfiles.delete(socketId);
    chatRooms.delete(socketId);
    groupRooms.delete(socketId);
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

/**
 * Get group chat by ID
 * @param {string} groupId - Group chat ID
 * @returns {Object|null} Group data or null if not found
 */
function getGroupChat(groupId) {
    return groupChats.get(groupId);
}

/**
 * Create a new group chat
 * @param {string} groupId - Group chat ID
 * @returns {Object} Created group data
 */
function createGroupChat(groupId) {
    const groupData = {
        id: groupId,
        members: [],
        createdAt: new Date(),
        maxMembers: 6
    };
    groupChats.set(groupId, groupData);
    return groupData;
}

/**
 * Add user to group chat
 * @param {string} groupId - Group chat ID
 * @param {string} socketId - Socket connection ID
 * @returns {boolean} Success status
 */
function addUserToGroup(groupId, socketId) {
    const group = groupChats.get(groupId);
    const user = users.get(socketId);

    if (!group || !user || group.members.length >= group.maxMembers) {
        return false;
    }

    group.members.push(socketId);
    user.isInGroup = true;
    groupRooms.set(socketId, groupId);
    return true;
}

/**
 * Remove user from group chat
 * @param {string} socketId - Socket connection ID
 * @returns {string|null} Group ID user was removed from
 */
function removeUserFromGroup(socketId) {
    const groupId = groupRooms.get(socketId);
    if (!groupId) return null;

    const group = groupChats.get(groupId);
    const user = users.get(socketId);

    if (group) {
        group.members = group.members.filter(memberId => memberId !== socketId);

        // Delete group if empty
        if (group.members.length === 0) {
            groupChats.delete(groupId);
        }
    }

    if (user) {
        user.isInGroup = false;
    }

    groupRooms.delete(socketId);
    return groupId;
}

/**
 * Find available group with space
 * @returns {string|null} Group ID with available space or null
 */
function findAvailableGroup() {
    for (const [groupId, group] of groupChats) {
        if (group.members.length < group.maxMembers) {
            return groupId;
        }
    }
    return null;
}

/**
 * Storage statistics for monitoring
 */
function getStorageStats() {
    return {
        users: users.size,
        waitingUsers: waitingUsers.size,
        activeChats: activeChats.size,
        groupChats: groupChats.size,
        chatRooms: chatRooms.size,
        userProfiles: userProfiles.size,
        timestamp: new Date()
    };
}

/**
 * Clear all storage (for testing/cleanup)
 */
function clearAllStorage() {
    users.clear();
    waitingUsers.clear();
    activeChats.clear();
    chatRooms.clear();
    userProfiles.clear();
    groupChats.clear();
    groupRooms.clear();
    waitingForGroup.clear();

    console.log('All storage cleared');
}

module.exports = {
    // Primary storage maps (used by repositories)
    users,
    waitingUsers,
    activeChats,
    chatRooms,
    userProfiles,
    groupChats,

    // Legacy storage (for backward compatibility)
    groupRooms,
    waitingForGroup,

    // Legacy helper functions (deprecated - use controllers instead)
    initializeUser,
    cleanupUser,
    getUser,
    getUserProfile,
    updateUserProfile,
    updateUserPreferences,
    getGroupChat,
    createGroupChat,
    addUserToGroup,
    removeUserFromGroup,
    findAvailableGroup,

    // Utility functions
    getStorageStats,
    clearAllStorage
};
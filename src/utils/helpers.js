/**
 * Utility helper functions
 * Common utilities used across the application
 */

/**
 * Generate a unique identifier
 * @param {string} prefix - Prefix for the ID
 * @param {number} length - Length of random part (default: 9)
 * @returns {string} Unique identifier
 */
function generateUniqueId(prefix = 'id', length = 9) {
    const randomPart = Math.random().toString(36).substring(2, 2 + length);
    return `${prefix}_${randomPart}`;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Format timestamp for logging
 * @param {Date} date - Date to format (default: now)
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date = new Date()) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Validate gender input
 * @param {string} gender - Gender to validate
 * @returns {boolean} True if valid gender
 */
function isValidGender(gender) {
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say', 'non-binary'];
    return validGenders.includes(gender);
}

/**
 * Validate preference input
 * @param {string} preference - Preference to validate
 * @returns {boolean} True if valid preference
 */
function isValidPreference(preference) {
    const validPreferences = ['male', 'female', 'any'];
    return validPreferences.includes(preference);
}

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element or null if empty array
 */
function getRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

module.exports = {
    generateUniqueId,
    isValidEmail,
    sanitizeInput,
    formatTimestamp,
    isValidGender,
    isValidPreference,
    getRandomElement,
    debounce
};
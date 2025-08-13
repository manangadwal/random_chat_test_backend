/**
 * Profanity filter for Hindi and English words
 * Filters inappropriate content from chat messages
 */

class ProfanityFilter {
    constructor() {
        // English inappropriate words list
        this.englishBadWords = [
            'fuck', 'shit', 'bitch', 'damn', 'ass', 'asshole', 'bastard', 'crap', 'piss',
            'dick', 'cock', 'pussy', 'whore', 'slut', 'faggot', 'nigger', 'retard',
            'motherfucker', 'cocksucker', 'douchebag', 'jackass', 'prick', 'twat',
            'cunt', 'bollocks', 'bugger', 'bloody', 'wanker', 'tosser', 'git',
            'moron', 'idiot', 'stupid', 'dumb', 'loser', 'freak', 'pervert',
            'sex', 'porn', 'nude', 'naked', 'boobs', 'tits', 'penis', 'vagina'
        ];

        // Hindi inappropriate words list (romanized)
        this.hindiBadWords = [
            'madarchod', 'bhenchod', 'bhosdike', 'chutiya', 'gandu', 'randi',
            'saala', 'saali', 'kamina', 'kutta', 'kutti', 'harami', 'badmaash',
            'chodu', 'lodu', 'bhosda', 'gaandu', 'rand', 'raand', 'chinaal',
            'hijra', 'chakka', 'behen', 'maa', 'baap', 'teri', 'meri',
            'chut', 'lund', 'lawda', 'lawde', 'bur', 'bhosadi', 'madarchod',
            'behenchod', 'sisterfucker', 'motherfucker', 'bhosdiwala', 'chutiyapa',
            'gand', 'gaand', 'tatti', 'haggu', 'mut', 'peshaab', 'potty'
        ];

        // Combine all inappropriate words and create regex patterns
        this.allBadWords = [...this.englishBadWords, ...this.hindiBadWords];
        this.createRegexPatterns();
    }

    /**
     * Create regex patterns for word matching with common substitutions
     */
    createRegexPatterns() {
        this.patterns = this.allBadWords.map(word => {
            // Handle common character substitutions (leet speak)
            let pattern = word
                .replace(/a/g, '[a@4]')
                .replace(/e/g, '[e3]')
                .replace(/i/g, '[i1!]')
                .replace(/o/g, '[o0]')
                .replace(/s/g, '[s$5]')
                .replace(/t/g, '[t7]')
                .replace(/l/g, '[l1]');

            return new RegExp(`\\b${pattern}\\b`, 'gi');
        });
    }

    /**
     * Filter inappropriate content from a message
     * @param {string} message - Original message
     * @returns {string} Filtered message with inappropriate words replaced
     */
    filterMessage(message) {
        if (!message || typeof message !== 'string') {
            return message;
        }

        let filteredMessage = message;

        // Apply each pattern and replace with asterisks
        this.patterns.forEach((pattern, index) => {
            const originalWord = this.allBadWords[index];
            const stars = '*'.repeat(originalWord.length);
            filteredMessage = filteredMessage.replace(pattern, stars);
        });

        // Handle common bypass attempts
        filteredMessage = this.handleBypassAttempts(filteredMessage);

        return filteredMessage;
    }

    /**
     * Handle common profanity bypass attempts
     * @param {string} message - Message to check
     * @returns {string} Message with bypass attempts filtered
     */
    handleBypassAttempts(message) {
        let filtered = message;

        this.allBadWords.forEach(word => {
            // Handle spaced letters (e.g., "f u c k" -> "****")
            const spacedPattern = word.split('').join('\\s*');
            const regex = new RegExp(`\\b${spacedPattern}\\b`, 'gi');
            const stars = '*'.repeat(word.length);
            filtered = filtered.replace(regex, stars);
        });

        return filtered;
    }

    /**
     * Check if message contains inappropriate content
     * @param {string} message - Message to check
     * @returns {boolean} True if profanity detected, false otherwise
     */
    containsProfanity(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }

        return this.patterns.some(pattern => pattern.test(message));
    }

    /**
     * Get severity level of inappropriate content (for future moderation features)
     * @param {string} message - Message to analyze
     * @returns {string} Severity level: 'high', 'medium', or 'low'
     */
    getSeverityLevel(message) {
        const severeBadWords = ['motherfucker', 'madarchod', 'bhenchod', 'nigger', 'faggot'];
        const hasSevere = severeBadWords.some(word =>
            message.toLowerCase().includes(word.toLowerCase())
        );

        if (hasSevere) return 'high';
        if (this.containsProfanity(message)) return 'medium';
        return 'low';
    }
}

module.exports = ProfanityFilter;
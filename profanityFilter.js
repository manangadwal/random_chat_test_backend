// Profanity filter for Hindi and English words
class ProfanityFilter {
    constructor() {
        // English bad words list (common ones)
        this.englishBadWords = [
            'fuck', 'shit', 'bitch', 'damn', 'ass', 'asshole', 'bastard', 'crap', 'piss',
            'dick', 'cock', 'pussy', 'whore', 'slut', 'faggot', 'nigger', 'retard',
            'motherfucker', 'cocksucker', 'douchebag', 'jackass', 'prick', 'twat',
            'cunt', 'bollocks', 'bugger', 'bloody', 'wanker', 'tosser', 'git',
            'moron', 'idiot', 'stupid', 'dumb', 'loser', 'freak', 'pervert',
            'sex', 'porn', 'nude', 'naked', 'boobs', 'tits', 'penis', 'vagina'
        ];

        // Hindi bad words list (romanized)
        this.hindiBadWords = [
            'madarchod', 'bhenchod', 'bhosdike', 'chutiya', 'gandu', 'randi',
            'saala', 'saali', 'kamina', 'kutta', 'kutti', 'harami', 'badmaash',
            'chodu', 'lodu', 'bhosda', 'gaandu', 'rand', 'raand', 'chinaal',
            'hijra', 'chakka', 'behen', 'maa', 'baap', 'teri', 'meri',
            'chut', 'lund', 'lawda', 'lawde', 'bur', 'bhosadi', 'madarchod',
            'behenchod', 'sisterfucker', 'motherfucker', 'bhosdiwala', 'chutiyapa',
            'gand', 'gaand', 'tatti', 'haggu', 'mut', 'peshaab', 'potty'
        ];

        // Combine all bad words and create regex patterns
        this.allBadWords = [...this.englishBadWords, ...this.hindiBadWords];
        this.createRegexPatterns();
    }

    createRegexPatterns() {
        // Create regex patterns for each word with word boundaries
        this.patterns = this.allBadWords.map(word => {
            // Handle variations like replacing letters with numbers/symbols
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

    filterMessage(message) {
        if (!message || typeof message !== 'string') {
            return message;
        }

        let filteredMessage = message;

        // Apply each pattern
        this.patterns.forEach((pattern, index) => {
            const originalWord = this.allBadWords[index];
            const stars = '*'.repeat(originalWord.length);
            filteredMessage = filteredMessage.replace(pattern, stars);
        });

        // Additional check for common bypassing techniques
        filteredMessage = this.handleBypassAttempts(filteredMessage);

        return filteredMessage;
    }

    handleBypassAttempts(message) {
        // Handle spaces between letters (e.g., "f u c k" -> "****")
        let filtered = message;
        
        this.allBadWords.forEach(word => {
            // Create spaced version pattern
            const spacedPattern = word.split('').join('\\s*');
            const regex = new RegExp(`\\b${spacedPattern}\\b`, 'gi');
            const stars = '*'.repeat(word.length);
            filtered = filtered.replace(regex, stars);
        });

        return filtered;
    }

    // Check if message contains profanity (for logging/monitoring)
    containsProfanity(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }

        return this.patterns.some(pattern => pattern.test(message));
    }

    // Get severity level (for future use)
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
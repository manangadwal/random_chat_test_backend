// Example: Profile Setup and Preferences Usage
// This example shows how to use the new profile and preferences events

const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:3000');

// Listen for connection
socket.on('connected', (data) => {
    console.log('Connected:', data);

    // Example 1: Setup profile immediately
    manageProfileExample();

    // Example 2: Set gender preference
    setGenderPreferenceExample();

    // Profile setup is optional - if not done, uses defaults
});

// Example profile setup/update (single event)
function manageProfileExample() {
    socket.emit('manageProfile', {
        name: 'John Doe',
        gender: 'male',
        avatar: 'https://example.com/avatar.jpg'
    });
}

// Example gender preference setting
function setGenderPreferenceExample() {
    socket.emit('setGenderPreference', {
        preferredGender: 'female' // Options: 'male', 'female', 'any'
    });
}

// Example preference removal
function removeGenderPreferenceExample() {
    socket.emit('removeGenderPreference');
}

// Listen for profile events
socket.on('profileUpdated', (data) => {
    console.log('Profile updated:', data);
    console.log('Profile data:', data.profile);
});

// Listen for gender preference updates
socket.on('genderPreferenceUpdated', (data) => {
    console.log('Gender preference updated:', data);
    console.log('Current preference:', data.preferences.preferredGender);

    // Now ready to start chatting
    socket.emit('startChat');
});

// Listen for chat events with enhanced partner info
socket.on('chatStarted', (data) => {
    console.log('Chat started with partner:', data.partnerId);
    console.log('Partner info:', data.partnerInfo);
    console.log('Partner name:', data.partnerInfo.name);
    console.log('Partner gender:', data.partnerInfo.gender);
    console.log('Partner avatar:', data.partnerInfo.avatar);

    // Send a message
    socket.emit('sendMessage', { message: `Hello ${data.partnerInfo.name}! Nice to meet you!` });
});

socket.on('messageReceived', (data) => {
    console.log('Message received:', data.message);
});

socket.on('waitingForPartner', () => {
    console.log('Waiting for compatible partner...');
});

// Example: Get current profile
function getProfileExample() {
    socket.emit('getProfile');
}

socket.on('profileData', (data) => {
    console.log('Current profile:', data.profile);
    console.log('Current preferences:', data.preferences);
});

// Example: Update profile later (same event as setup)
function updateProfileLaterExample() {
    socket.emit('manageProfile', {
        name: 'John Updated',
        avatar: 'https://example.com/new-avatar.jpg'
    });
}

// Example: Change gender preference
function changeGenderPreferenceExample() {
    socket.emit('setGenderPreference', { preferredGender: 'any' });
}

// Error handling
socket.on('error', (error) => {
    console.error('Error:', error);
});
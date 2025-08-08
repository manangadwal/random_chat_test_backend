# Profile & Preferences Features

## Overview

Enhanced the random chat server with optional profile setup and smart matching based on user preferences.

## New Features Added

### 1. Connection Events

- **`connected`** event sent immediately after user connects
- Includes user ID, timestamp, and profile setup requirement
- Replaces the basic connection acknowledgment

### 2. Optional Profile System

- **Name**: Display name shown to chat partners
- **Gender**: String value (male/female/other) for gender preferences
- **Avatar**: Profile picture URL
- **Profile can be skipped** and set up later in settings

### 3. Chat Preferences

- **Preferred Gender**: Filter matches by gender ('male', 'female', 'any')

### 4. Smart Matching Algorithm

The server now uses a compatibility system that considers:

- **Mutual gender preferences** - Both users' preferences must be satisfied

### 5. New Socket Events

#### Client to Server:

- `setupProfile` - Set up user profile with age, gender, interests, location
- `skipProfileSetup` - Skip profile setup (can be done later)
- `updatePreferences` - Set chat matching preferences
- `getProfile` - Get current profile and preferences
- `updateProfile` - Update existing profile information

#### Server to Client:

- `connected` - Connection confirmation with user details
- `profileUpdated` - Profile setup/update completed
- `profileSkipped` - Profile setup was skipped
- `preferencesUpdated` - Chat preferences updated
- `profileData` - Current profile and preferences data

### 6. Backward Compatibility

- All existing events still work as before
- Users without profiles can still chat (matches with anyone)
- Default preferences allow matching with any user
- Existing Flutter integration continues to work

### 7. Enhanced Waiting System

- Waiting queue now stores user preferences
- Matching considers compatibility before pairing users
- Falls back to any available user if no compatible match found

## Usage Examples

### Basic Profile Setup

```javascript
socket.emit("manageProfile", {
  name: "John Doe",
  gender: "male",
  avatar: "https://example.com/avatar.jpg",
});
```

### Setting Preferences

```javascript
socket.emit("setGenderPreference", {
  preferredGender: "female", // Options: 'male', 'female', 'any'
});
```

## Benefits

1. **Better Matches**: Users can find more compatible chat partners
2. **Optional Setup**: Profile setup is completely optional
3. **Flexible Preferences**: Users can be as specific or general as they want
4. **Settings Integration**: Profile and preferences can be updated anytime
5. **Smart Fallback**: If no compatible match found, pairs with any available user
6. **Enhanced UX**: More personalized chat experience

## Implementation Notes

- Uses in-memory storage (no database required)
- Maintains all existing functionality
- Efficient matching algorithm with O(n) complexity
- Comprehensive error handling
- Detailed logging for debugging
- Full Flutter integration examples provided

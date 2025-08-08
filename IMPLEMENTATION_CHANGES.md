# Implementation Changes - Profile & Matching System

## Overview

This document outlines the changes made to implement a simplified profile and gender preference system for the random chat server.

## Key Changes Made

### 1. Profile Management Simplification

#### Before:

- Separate `setupProfile` and `updateProfile` events
- Complex profile setup flow

#### After:

- **Single `manageProfile` event** for both setup and updates
- Only updates fields that are provided in the request
- Supports: name, gender, avatar

```javascript
// Single event for all profile operations
socket.emit("manageProfile", {
  name: "John",
  gender: "male",
  avatar: "avatar_url",
});
```

### 2. Gender Preference System

#### New Events:

- **`setGenderPreference`** - Set preference to 'male', 'female', or 'any'
- **`removeGenderPreference`** - Remove preference (sets to 'any')

#### Supported Values:

- `'male'` - Match only with male users
- `'female'` - Match only with female users
- `'any'` - Match with anyone (default)

```javascript
// Set gender preference
socket.emit("setGenderPreference", { preferredGender: "female" });

// Remove preference (match with anyone)
socket.emit("removeGenderPreference");
```

### 3. Enhanced Chat Started Event

#### Before:

```javascript
socket.emit("chatStarted", { chatId, partnerId });
```

#### After:

```javascript
socket.emit("chatStarted", {
  chatId,
  partnerId,
  partnerInfo: {
    name: "John" || "Anonymous",
    avatar: "avatar_url" || null,
    gender: "male" || null,
  },
});
```

### 4. Updated Profile Structure

```javascript
// Profile now includes:
{
    name: string || null,
    gender: string || null,
    avatar: string || null,
    isProfileComplete: boolean
}
```

## Event Changes Summary

### Removed Events:

- `setupProfile` ❌
- `updateProfile` ❌
- `updatePreferences` ❌
- `skipProfileSetup` ❌

### New/Updated Events:

#### Client to Server:

| Event                    | Description                         | Payload                       |
| ------------------------ | ----------------------------------- | ----------------------------- | -------- | -------- |
| `manageProfile`          | Setup or update user profile        | `{ name?, gender?, avatar? }` |
| `setGenderPreference`    | Set gender matching preference      | `{ preferredGender: 'male'    | 'female' | 'any' }` |
| `removeGenderPreference` | Remove gender preference            | None                          |
| `getProfile`             | Get current profile and preferences | None                          |

#### Server to Client:

| Event                     | Description                     | Payload                                                        |
| ------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `profileUpdated`          | Profile updated successfully    | `{ profile: object, message: string }`                         |
| `genderPreferenceUpdated` | Gender preference updated       | `{ preferences: object, message: string }`                     |
| `chatStarted`             | Chat started with partner info  | `{ chatId, partnerId, partnerInfo: { name, avatar, gender } }` |
| `profileData`             | Current profile and preferences | `{ profile: object, preferences: object }`                     |

## Implementation Guide

### 1. Frontend Integration

#### Profile Management:

```javascript
// Setup/Update profile (single event)
socket.emit("manageProfile", {
  name: "John Doe",
  gender: "male",
  avatar: "https://example.com/avatar.jpg",
});

// Listen for profile updates
socket.on("profileUpdated", (data) => {
  console.log("Profile updated:", data.profile);
  // Update UI with new profile data
});
```

#### Gender Preferences:

```javascript
// Set gender preference
socket.emit("setGenderPreference", { preferredGender: "female" });

// Remove preference
socket.emit("removeGenderPreference");

// Listen for preference updates
socket.on("genderPreferenceUpdated", (data) => {
  console.log("Preference:", data.preferences.preferredGender);
  // Update UI to show current preference
});
```

#### Enhanced Chat Experience:

```javascript
// Listen for chat started with partner info
socket.on("chatStarted", (data) => {
  console.log("Chat started with:", data.partnerInfo.name);
  console.log("Partner gender:", data.partnerInfo.gender);
  console.log("Partner avatar:", data.partnerInfo.avatar);

  // Update UI to show partner information
  displayPartnerInfo(data.partnerInfo);
});
```

### 2. UI Components to Update

#### Profile Settings Screen:

- Single form for profile fields
- Name input field
- Avatar upload/selection
- Gender selection

#### Gender Preference Settings:

- Radio buttons: Any, Male, Female
- "Remove Preference" button
- Current preference display

#### Chat Interface:

- Partner name display
- Partner avatar display
- Gender indicator (optional)

### 3. Database Schema (if using database)

```sql
-- User profiles table
CREATE TABLE user_profiles (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100),
    gender VARCHAR(10),
    avatar VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    preferred_gender VARCHAR(10) DEFAULT 'any',
    updated_at TIMESTAMP
);
```

### 4. Flutter Implementation Example

```dart
class ChatService {
  // Profile management
  void updateProfile({
    String? name,
    String? gender,
    String? avatar,
  }) {
    socket.emit('manageProfile', {
      if (name != null) 'name': name,
      if (gender != null) 'gender': gender,
      if (avatar != null) 'avatar': avatar,
    });
  }

  // Gender preference
  void setGenderPreference(String preference) {
    socket.emit('setGenderPreference', {
      'preferredGender': preference
    });
  }

  void removeGenderPreference() {
    socket.emit('removeGenderPreference');
  }

  // Listen for enhanced chat started
  void setupChatListeners() {
    socket.on('chatStarted', (data) {
      final partnerInfo = data['partnerInfo'];
      // Update UI with partner information
      onChatStarted(
        chatId: data['chatId'],
        partnerId: data['partnerId'],
        partnerName: partnerInfo['name'] ?? 'Anonymous',
        partnerAvatar: partnerInfo['avatar'],
        partnerGender: partnerInfo['gender'],
      );
    });
  }
}
```

## Benefits of Changes

1. **Simplified API**: Single event for profile management
2. **Better UX**: Partner information shown when chat starts
3. **Flexible Preferences**: Easy to set/remove gender preferences
4. **Enhanced Matching**: Shows partner's name/avatar for better connection
5. **Cleaner Code**: Reduced number of events to handle
6. **Future-Ready**: Easy to extend with more profile fields

## Migration Notes

### For Existing Clients:

1. Replace `setupProfile` and `updateProfile` calls with `manageProfile`
2. Replace `updatePreferences` with `setGenderPreference`
3. Update `chatStarted` event handler to use new `partnerInfo` structure
4. Remove `skipProfileSetup` event handlers

### Backward Compatibility:

- Old events will not work and should be updated
- Profile structure is enhanced but existing fields remain compatible
- Default values ensure system works even with incomplete profiles

## Testing Checklist

- [ ] Profile creation with new `manageProfile` event
- [ ] Profile updates with partial data
- [ ] Gender preference setting and removal
- [ ] Chat matching with gender preferences
- [ ] Partner information display in chat
- [ ] Default values for missing profile data
- [ ] Error handling for invalid preferences
- [ ] Multiple users with different preferences
- [ ] Profile data persistence across connections

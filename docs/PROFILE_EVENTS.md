# Profile Management Events Documentation

## Overview

Profile management events handle user profile creation, updates, and retrieval. Users can set display names, avatars, gender information, and nicknames to personalize their chat experience.

---

## ⚙️ `manageProfile`

**Direction**: Client → Server  
**Trigger**: User wants to create or update their profile

### Purpose

Creates or updates user profile information including name, gender, avatar, and nickname.

### Payload

```javascript
{
  name?: string,        // Display name (optional)
  gender?: string,      // Gender (optional: 'male', 'female', 'other', 'non-binary', 'prefer-not-to-say')
  avatar?: string,      // Avatar URL or identifier (optional)
  nickname?: string     // Nickname for display (optional)
}
```

### Validation Rules

- **Name**: Maximum 50 characters, sanitized for XSS
- **Nickname**: Maximum 30 characters, sanitized for XSS
- **Gender**: Must be valid gender value
- **Avatar**: Sanitized string input

### Server Processing

1. Validate all input data
2. Sanitize text inputs to prevent XSS
3. Update user profile with provided fields
4. Mark profile as complete
5. Send confirmation via `profileUpdated`

### Server Response Events

- `profileUpdated` - Successful profile update
- `error` - Validation failed or other error

### Example

```javascript
// Client updates profile
socket.emit("manageProfile", {
  name: "Alex",
  gender: "non-binary",
  avatar: "avatar_url_or_id",
  nickname: "AlexChat",
});

// Server responses
socket.on("profileUpdated", (data) => {
  console.log("Profile updated successfully");
  console.log("Updated profile:", data.profile);
});

socket.on("error", (error) => {
  console.log("Profile update failed:", error.message);
});
```

### Use Cases

- Initial profile setup
- Update existing profile
- Change display preferences
- Personalize chat experience

---

## ✅ `profileUpdated`

**Direction**: Server → Client  
**Trigger**: When profile is successfully updated

### Purpose

Confirms successful profile update and returns the updated profile data.

### Payload

```javascript
{
  profile: {
    name: string|null,           // User's display name
    gender: string|null,         // User's gender
    avatar: string|null,         // User's avatar
    nickname: string|null,       // User's nickname
    isProfileComplete: boolean   // Whether profile is complete
  },
  message: string               // Success message
}
```

### Example

```javascript
socket.on("profileUpdated", (data) => {
  console.log("Success:", data.message);
  console.log("Updated profile:", data.profile);

  // Update UI with new profile data
  updateProfileDisplay(data.profile);

  // Show success notification
  showSuccessMessage(data.message);

  // Enable chat features if profile now complete
  if (data.profile.isProfileComplete) {
    enableChatFeatures();
  }
});
```

### Use Cases

- Confirm profile changes
- Update UI with new data
- Enable features after setup
- Show success feedback

---

## 📋 `getProfile`

**Direction**: Client → Server  
**Trigger**: User requests their current profile data

### Purpose

Retrieves current user profile and preference information.

### Payload

None

### Server Response Event

- `profileData` - Current profile and preferences

### Example

```javascript
// Client requests profile data
socket.emit("getProfile");

// Server responds with profile data
socket.on("profileData", (data) => {
  console.log("Current profile:", data.profile);
  console.log("Preferences:", data.preferences);
});
```

### Use Cases

- Load profile for editing
- Display current settings
- Initialize profile UI
- Sync profile state

---

## 📊 `profileData`

**Direction**: Server → Client  
**Trigger**: Response to `getProfile` request

### Purpose

Provides current user profile and preference information.

### Payload

```javascript
{
  profile: {
    name: string|null,           // User's display name
    gender: string|null,         // User's gender
    avatar: string|null,         // User's avatar
    nickname: string|null,       // User's nickname
    isProfileComplete: boolean   // Whether profile is complete
  },
  preferences: {
    preferredGender: string      // Gender preference ('male', 'female', 'any')
  }
}
```

### Example

```javascript
socket.on("profileData", (data) => {
  console.log("Profile Data Received:");
  console.log("Name:", data.profile.name || "Not set");
  console.log("Gender:", data.profile.gender || "Not set");
  console.log("Nickname:", data.profile.nickname || "Not set");
  console.log("Profile Complete:", data.profile.isProfileComplete);
  console.log("Gender Preference:", data.preferences.preferredGender);

  // Populate profile form
  populateProfileForm(data.profile);

  // Set preference controls
  setPreferenceControls(data.preferences);
});
```

### Use Cases

- Display profile information
- Populate edit forms
- Show current settings
- Initialize UI state

---

## 🎯 `setGenderPreference`

**Direction**: Client → Server  
**Trigger**: User sets or updates gender preference for matching

### Purpose

Sets the user's preferred gender for chat partner matching.

### Payload

```javascript
{
  preferredGender: string; // 'male', 'female', or 'any'
}
```

### Validation

- Must be one of: 'male', 'female', 'any'
- Invalid values default to 'any'

### Server Response Event

- `genderPreferenceUpdated` - Preference update confirmation

### Example

```javascript
// Client sets gender preference
socket.emit("setGenderPreference", {
  preferredGender: "female",
});

// Server confirms update
socket.on("genderPreferenceUpdated", (data) => {
  console.log("Preference updated:", data.message);
  console.log("New preferences:", data.preferences);
});
```

### Use Cases

- Set matching preferences
- Filter chat partners
- Customize matching experience
- Update user preferences

---

## 🚫 `removeGenderPreference`

**Direction**: Client → Server  
**Trigger**: User removes gender preference (sets to 'any')

### Purpose

Removes gender preference by setting it to 'any', allowing matches with all genders.

### Payload

None

### Server Response Event

- `genderPreferenceUpdated` - Preference removal confirmation

### Example

```javascript
// Client removes gender preference
socket.emit("removeGenderPreference");

// Server confirms removal
socket.on("genderPreferenceUpdated", (data) => {
  console.log("Preference removed:", data.message);
  console.log("Updated preferences:", data.preferences);
});
```

### Use Cases

- Remove matching restrictions
- Allow all gender matches
- Reset preferences
- Broaden matching pool

---

## 🔄 `genderPreferenceUpdated`

**Direction**: Server → Client  
**Trigger**: When gender preference is updated or removed

### Purpose

Confirms gender preference changes and provides updated preference data.

### Payload

```javascript
{
  preferences: {
    preferredGender: string  // Updated preference value
  },
  message: string           // Confirmation message
}
```

### Example Messages

- `"Gender preference set to: female"`
- `"Gender preference set to: male"`
- `"Gender preference removed - will match with anyone"`

### Example

```javascript
socket.on("genderPreferenceUpdated", (data) => {
  console.log("Preference Update:", data.message);
  console.log("Current preference:", data.preferences.preferredGender);

  // Update preference display
  updatePreferenceDisplay(data.preferences.preferredGender);

  // Show confirmation message
  showPreferenceUpdateMessage(data.message);

  // Update matching status if applicable
  if (data.preferences.preferredGender === "any") {
    showBroaderMatchingMessage();
  }
});
```

### Use Cases

- Confirm preference changes
- Update UI controls
- Show feedback messages
- Update matching behavior

---

## 🔄 Profile Management Flow

### Initial Profile Setup

```
User connects → Profile incomplete → Show setup modal
     ↓
User fills profile → manageProfile event → Validation
     ↓
Success → profileUpdated → Enable chat features
```

### Profile Update Flow

```
User opens settings → getProfile → profileData received
     ↓
User modifies data → manageProfile → Validation
     ↓
Success → profileUpdated → UI updated
```

### Preference Management Flow

```
User sets preference → setGenderPreference → Validation
     ↓
Success → genderPreferenceUpdated → Matching updated
```

---

## 🛠️ Implementation Examples

### Complete Profile Manager

```javascript
class ProfileManager {
  constructor(socket) {
    this.socket = socket;
    this.currentProfile = null;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on("profileUpdated", (data) => {
      this.onProfileUpdated(data);
    });

    this.socket.on("profileData", (data) => {
      this.onProfileData(data);
    });

    this.socket.on("genderPreferenceUpdated", (data) => {
      this.onPreferenceUpdated(data);
    });

    this.socket.on("error", (error) => {
      this.onError(error);
    });
  }

  updateProfile(profileData) {
    // Validate data before sending
    if (this.validateProfileData(profileData)) {
      this.socket.emit("manageProfile", profileData);
    }
  }

  getProfile() {
    this.socket.emit("getProfile");
  }

  setGenderPreference(gender) {
    if (["male", "female", "any"].includes(gender)) {
      this.socket.emit("setGenderPreference", {
        preferredGender: gender,
      });
    }
  }

  removeGenderPreference() {
    this.socket.emit("removeGenderPreference");
  }

  validateProfileData(data) {
    if (data.name && data.name.length > 50) {
      this.showError("Name must be 50 characters or less");
      return false;
    }

    if (data.nickname && data.nickname.length > 30) {
      this.showError("Nickname must be 30 characters or less");
      return false;
    }

    return true;
  }

  onProfileUpdated(data) {
    this.currentProfile = data.profile;
    console.log("Profile updated successfully");
    this.showSuccess(data.message);
    this.updateUI(data.profile);
  }

  onProfileData(data) {
    this.currentProfile = data.profile;
    this.populateForm(data.profile);
    this.setPreferences(data.preferences);
  }

  onPreferenceUpdated(data) {
    console.log("Preference updated:", data.message);
    this.updatePreferenceUI(data.preferences);
    this.showSuccess(data.message);
  }

  onError(error) {
    console.error("Profile error:", error.message);
    this.showError(error.message);
  }

  // UI helper methods
  updateUI(profile) {
    // Update profile display
  }

  populateForm(profile) {
    // Fill form with current data
  }

  setPreferences(preferences) {
    // Set preference controls
  }

  updatePreferenceUI(preferences) {
    // Update preference display
  }

  showSuccess(message) {
    // Show success notification
  }

  showError(message) {
    // Show error notification
  }
}
```

### Profile Form Handler

```javascript
class ProfileForm {
  constructor(profileManager) {
    this.profileManager = profileManager;
    this.setupForm();
  }

  setupForm() {
    const form = document.getElementById("profileForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Load current profile
    this.profileManager.getProfile();
  }

  handleSubmit() {
    const formData = new FormData(document.getElementById("profileForm"));

    const profileData = {
      name: formData.get("name"),
      gender: formData.get("gender"),
      avatar: formData.get("avatar"),
      nickname: formData.get("nickname"),
    };

    // Remove empty values
    Object.keys(profileData).forEach((key) => {
      if (!profileData[key]) {
        delete profileData[key];
      }
    });

    this.profileManager.updateProfile(profileData);
  }

  populateForm(profile) {
    document.getElementById("name").value = profile.name || "";
    document.getElementById("gender").value = profile.gender || "";
    document.getElementById("avatar").value = profile.avatar || "";
    document.getElementById("nickname").value = profile.nickname || "";
  }
}
```

---

## 📊 Profile Analytics

### Metrics Tracked

- Profile completion rate
- Most common gender selections
- Avatar usage statistics
- Nickname adoption rate
- Preference distribution

### User Behavior Insights

- Time to complete profile
- Profile update frequency
- Preference change patterns
- Feature usage correlation

---

## 🔧 Troubleshooting

### Common Issues

**Profile Won't Update**

- Check input validation
- Verify field length limits
- Review special characters
- Check server connection

**Preferences Not Saving**

- Verify valid preference values
- Check event handling
- Review server response
- Monitor error messages

**Profile Data Not Loading**

- Check getProfile request
- Verify event handlers
- Review server response
- Check UI population logic

**Validation Errors**

- Review input constraints
- Check character limits
- Verify required fields
- Test edge cases

### Best Practices

**Client Implementation**

- Validate inputs before sending
- Handle all response events
- Provide clear error messages
- Show loading states

**User Experience**

- Clear field requirements
- Real-time validation feedback
- Intuitive form design
- Progress indicators

**Security Considerations**

- Sanitize all inputs
- Validate on both client and server
- Prevent XSS attacks
- Limit input lengths

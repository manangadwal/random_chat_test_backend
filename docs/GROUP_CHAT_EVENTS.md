# Group Chat Events Documentation

## Overview

Group chat events handle multi-user conversations where up to 6 participants can chat together in real-time. Users are automatically assigned to available groups or new groups are created as needed.

---

## 🏠 `joinGroup`

**Direction**: Client → Server  
**Trigger**: User wants to join a group chat

### Purpose

Requests to join an available group chat or create a new one if none available.

### Payload

None

### Server Processing

1. Check if user is already in one-on-one chat (blocks group join)
2. Leave current group if already in one
3. Find available group with space
4. Create new group if none available
5. Add user to group and notify all members

### Server Response Events

- `groupJoined` - Successful group join
- `error` - If user in one-on-one chat or other error

### Example

```javascript
// Client requests to join group
socket.emit("joinGroup");

// Server responses
socket.on("groupJoined", (data) => {
  console.log("Joined group:", data.groupId);
  console.log("Members:", data.memberCount + "/" + data.maxMembers);
});

socket.on("error", (error) => {
  console.log("Cannot join group:", error.message);
});
```

### Use Cases

- Join group conversation
- Switch from one-on-one to group chat
- Find active group discussions

---

## ✅ `groupJoined`

**Direction**: Server → Client  
**Trigger**: When user successfully joins a group

### Purpose

Confirms successful group join and provides group information.

### Payload

```javascript
{
  groupId: string,       // Unique group ID
  memberCount: number,   // Current number of members
  maxMembers: number,    // Maximum allowed members (6)
  groupInfo: {
    id: string,          // Group ID
    memberCount: number, // Current members
    maxMembers: number,  // Max members
    hasSpace: boolean,   // Whether group has space
    createdAt: Date      // Group creation time
  }
}
```

### Example

```javascript
socket.on("groupJoined", (data) => {
  console.log("Successfully joined group:", data.groupId);
  console.log("Group has", data.memberCount, "members");

  // Update UI to show group chat interface
  showGroupChatInterface(data.groupInfo);

  // Show group status
  updateGroupStatus(data.memberCount, data.maxMembers);
});
```

### Use Cases

- Display group information
- Show member count
- Initialize group chat UI
- Update navigation state

---

## 👋 `userJoinedGroup`

**Direction**: Server → All Group Members  
**Trigger**: When a new user joins the group

### Purpose

Notifies all existing group members that a new user has joined.

### Payload

```javascript
{
  groupId: string,       // Group ID
  userId: string,        // New member's socket ID
  userInfo: {
    name: string,        // User's display name
    avatar: string|null, // User's avatar
    gender: string|null, // User's gender
    nickname: string|null // User's nickname
  },
  memberCount: number,   // Updated member count
  timestamp: Date        // Join timestamp
}
```

### Example

```javascript
socket.on("userJoinedGroup", (data) => {
  console.log(data.userInfo.name + " joined the group");

  // Add join notification to chat
  addSystemMessage(data.userInfo.name + " joined the group");

  // Update member count display
  updateMemberCount(data.memberCount);

  // Optional: Show welcome animation
  showJoinAnimation(data.userInfo);
});
```

### Use Cases

- Notify group of new members
- Update member count
- Show join notifications
- Welcome new members

---

## 💬 `sendGroupMessage`

**Direction**: Client → Server  
**Trigger**: User sends a message to the group

### Purpose

Sends a message to all members of the group with profanity filtering.

### Payload

```javascript
{
  message: string; // Message content to send
}
```

### Server Processing

1. Verify user is in a group
2. Apply profanity filtering
3. Log filtered content if applicable
4. Broadcast to all group members via `groupMessageReceived`

### Example

```javascript
// Client sends group message
socket.emit("sendGroupMessage", {
  message: "Hello everyone! How is everyone doing?",
});
```

### Use Cases

- Send messages to group
- Participate in group discussions
- Share information with multiple users

---

## 📨 `groupMessageReceived`

**Direction**: Server → All Group Members (except sender)  
**Trigger**: When a group member sends a message

### Purpose

Delivers group messages to all members except the sender.

### Payload

```javascript
{
  id: string,            // Message ID
  senderId: string,      // Sender's socket ID
  senderName: string,    // Sender's display name
  senderNickname: string|null, // Sender's nickname
  content: string,       // Message content (filtered)
  timestamp: Date,       // Message timestamp
  isFiltered: boolean,   // Whether content was filtered
  edited: boolean,       // Whether message was edited
  editedAt: Date|null,   // Edit timestamp
  chatId: null,          // Always null for group messages
  groupId: string,       // Group ID
  memberCount: number    // Current group member count
}
```

### Example

```javascript
socket.on("groupMessageReceived", (message) => {
  console.log("Group message from", message.senderName + ":", message.content);

  // Add message to group chat UI
  addGroupMessage({
    sender: message.senderName,
    content: message.content,
    timestamp: message.timestamp,
    isOwn: false,
    memberCount: message.memberCount,
  });

  // Show notification if window not focused
  if (!document.hasFocus()) {
    showNotification("New group message from " + message.senderName);
  }
});
```

### Use Cases

- Display group messages
- Show sender information
- Update chat history
- Handle notifications

---

## 🚪 `endGroupChat`

**Direction**: Client → Server  
**Trigger**: User wants to leave the group chat

### Purpose

Removes user from current group and notifies other members.

### Payload

None

### Server Actions

1. Remove user from group
2. Update user status
3. Notify remaining members with `userLeftGroup`
4. Delete group if empty
5. Send `groupLeft` confirmation to user

### Example

```javascript
// Client leaves group
socket.emit("endGroupChat");

// Confirmation received
socket.on("groupLeft", (data) => {
  console.log("Left group:", data.groupId);
  showMainInterface();
});
```

### Use Cases

- Leave group conversation
- Return to main menu
- Switch to one-on-one chat

---

## 👋 `userLeftGroup`

**Direction**: Server → Remaining Group Members  
**Trigger**: When a user leaves the group

### Purpose

Notifies remaining group members that someone has left.

### Payload

```javascript
{
  groupId: string,       // Group ID
  userId: string,        // User who left
  userInfo: {
    name: string,        // User's display name
    avatar: string|null, // User's avatar
    gender: string|null, // User's gender
    nickname: string|null // User's nickname
  },
  memberCount: number,   // Updated member count
  timestamp: Date        // Leave timestamp
}
```

### Example

```javascript
socket.on("userLeftGroup", (data) => {
  console.log(data.userInfo.name + " left the group");

  // Add leave notification to chat
  addSystemMessage(data.userInfo.name + " left the group");

  // Update member count
  updateMemberCount(data.memberCount);

  // Optional: Show leave animation
  showLeaveAnimation(data.userInfo);
});
```

### Use Cases

- Notify group of departures
- Update member count
- Show leave notifications
- Handle group dynamics

---

## ✅ `groupLeft`

**Direction**: Server → Client  
**Trigger**: Confirmation that user has left the group

### Purpose

Confirms successful departure from group chat.

### Payload

```javascript
{
  groupId: string,  // Group that was left
  timestamp: Date   // Leave timestamp
}
```

### Example

```javascript
socket.on("groupLeft", (data) => {
  console.log("Successfully left group:", data.groupId);

  // Clear group chat interface
  clearGroupChatInterface();

  // Return to main menu
  showMainInterface();

  // Update navigation state
  updateNavigationState("main");
});
```

### Use Cases

- Confirm group departure
- Clear group chat UI
- Update application state
- Return to main interface

---

## 📊 `getGroupStats`

**Direction**: Client → Server  
**Trigger**: User requests group chat statistics

### Purpose

Requests current group chat statistics and metrics.

### Payload

None

### Server Response Event

- `groupStats` - Current group statistics

### Example

```javascript
// Request group statistics
socket.emit("getGroupStats");

// Receive statistics
socket.on("groupStats", (stats) => {
  console.log("Group Statistics:", stats);
  displayGroupStats(stats);
});
```

### Use Cases

- Display group activity
- Show platform statistics
- Monitor group usage
- Analytics dashboard

---

## 📈 `groupStats`

**Direction**: Server → Client  
**Trigger**: Response to `getGroupStats` request or periodic updates

### Purpose

Provides current group chat statistics and metrics.

### Payload

```javascript
{
  totalGroups: number,        // Total number of groups
  activeGroups: number,       // Currently active groups
  totalMembers: number,       // Total users in groups
  totalMessages: number,      // Total group messages
  averageGroupSize: number,   // Average members per group
  maxGroupSize: number,       // Maximum allowed group size (6)
  availableSlots: number,     // Available spaces across all groups
  timestamp: Date             // Statistics timestamp
}
```

### Example

```javascript
socket.on("groupStats", (stats) => {
  console.log("Group Chat Statistics:");
  console.log("Active Groups:", stats.activeGroups);
  console.log("Total Members:", stats.totalMembers);
  console.log("Average Group Size:", stats.averageGroupSize);

  // Update statistics display
  updateStatsDisplay(stats);
});
```

### Use Cases

- Display platform activity
- Show group metrics
- Monitor system health
- Analytics and reporting

---

## 🔄 Group Chat Flow Diagram

```
User A                    Server                    Users B,C,D
  |                         |                         |
  |-----> joinGroup         |                         |
  |                         |-----> findAvailableGroup
  |                         |                         |
  |<----- groupJoined       |                         |
  |                         |   userJoinedGroup ----->|
  |                         |                         |
  |-----> sendGroupMessage  |                         |
  |                         | groupMessageReceived -->|
  |                         |                         |
  |                         |   sendGroupMessage <----|
  |<----- groupMessageReceived                        |
  |                         |                         |
  |-----> endGroupChat      |                         |
  |<----- groupLeft         |                         |
  |                         |    userLeftGroup ------>|
```

---

## 🛠️ Implementation Examples

### Complete Group Chat Client

```javascript
class GroupChatClient {
  constructor() {
    this.socket = io();
    this.currentGroup = null;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on("groupJoined", (data) => {
      this.onGroupJoined(data);
    });

    this.socket.on("userJoinedGroup", (data) => {
      this.onUserJoined(data);
    });

    this.socket.on("groupMessageReceived", (message) => {
      this.onGroupMessage(message);
    });

    this.socket.on("userLeftGroup", (data) => {
      this.onUserLeft(data);
    });

    this.socket.on("groupLeft", (data) => {
      this.onGroupLeft(data);
    });

    this.socket.on("groupStats", (stats) => {
      this.onGroupStats(stats);
    });
  }

  joinGroup() {
    this.socket.emit("joinGroup");
  }

  sendMessage(text) {
    this.socket.emit("sendGroupMessage", { message: text });
  }

  leaveGroup() {
    this.socket.emit("endGroupChat");
  }

  getStats() {
    this.socket.emit("getGroupStats");
  }

  onGroupJoined(data) {
    this.currentGroup = data.groupId;
    console.log("Joined group with", data.memberCount, "members");
    // Update UI
  }

  onUserJoined(data) {
    console.log(data.userInfo.name, "joined the group");
    // Add join notification
  }

  onGroupMessage(message) {
    console.log("Group message:", message.content);
    // Add to chat display
  }

  onUserLeft(data) {
    console.log(data.userInfo.name, "left the group");
    // Add leave notification
  }

  onGroupLeft(data) {
    this.currentGroup = null;
    console.log("Left group successfully");
    // Return to main interface
  }

  onGroupStats(stats) {
    console.log("Group stats:", stats);
    // Update statistics display
  }
}
```

---

## 📊 Group Chat Metrics

### Key Performance Indicators

- Group formation rate
- Average group lifetime
- Messages per group
- Member retention rate
- Group utilization rate

### User Engagement Metrics

- Time spent in groups
- Messages sent per user
- Group switching frequency
- Peak group activity times

---

## 🔧 Troubleshooting

### Common Issues

**Cannot Join Group**

- Check if in one-on-one chat
- Verify server connection
- Review error messages
- Check group availability

**Messages Not Appearing**

- Verify group membership
- Check WebSocket connection
- Review message filtering
- Monitor server logs

**Group Members Not Updating**

- Check event handling
- Verify UI update logic
- Monitor join/leave events
- Review member count display

**Performance Issues**

- Monitor group size limits
- Check message broadcast efficiency
- Review memory usage
- Optimize UI updates

### Best Practices

**Client Implementation**

- Handle all group events
- Update UI responsively
- Show loading states
- Implement error recovery

**User Experience**

- Clear join/leave notifications
- Responsive member count updates
- Smooth message display
- Intuitive group navigation

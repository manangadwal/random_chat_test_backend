# Connection Events Documentation

## Overview

Connection events handle the basic WebSocket connection lifecycle, including user connection, disconnection, and initial setup.

---

## 📡 `connected`

**Direction**: Server → Client  
**Trigger**: Automatically sent when user connects to WebSocket server

### Purpose

Confirms successful connection and provides initial user information.

### Payload

```javascript
{
  userId: string,           // Unique socket ID for the user
  timestamp: Date,          // Connection timestamp
  requiresProfileSetup: boolean  // Whether user needs to set up profile
}
```

### Example

```javascript
socket.on("connected", (data) => {
  console.log("Connected with ID:", data.userId);
  console.log("Profile setup required:", data.requiresProfileSetup);
});
```

### Use Cases

- Display user ID to client
- Determine if profile setup is needed
- Initialize client-side user state
- Log connection events

---

## 🔌 `disconnect`

**Direction**: Client → Server  
**Trigger**: When user closes browser, navigates away, or loses connection

### Purpose

Handles cleanup when user disconnects from the server.

### Payload

None (automatic event)

### Server Actions

1. End any active one-on-one chat
2. Remove user from group chats
3. Remove from waiting queues
4. Clean up user data
5. Broadcast updated user count

### Example

```javascript
// Client-side (automatic)
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Server-side handling (automatic)
socket.on("disconnect", () => {
  // Cleanup performed automatically
});
```

### Use Cases

- Automatic resource cleanup
- Partner notification in active chats
- Group member removal
- Statistics updates

---

## 👥 `activeUsers`

**Direction**: Server → Client  
**Trigger**: Broadcast when user count changes (connect/disconnect)

### Purpose

Provides real-time count of active users on the platform.

### Payload

```javascript
number; // Total count of active users
```

### Example

```javascript
socket.on("activeUsers", (count) => {
  console.log("Active users:", count);
  document.getElementById("userCount").textContent = count;
});
```

### Use Cases

- Display active user count in UI
- Show platform activity level
- Analytics and monitoring
- User engagement metrics

---

## ❌ `error`

**Direction**: Server → Client  
**Trigger**: When an error occurs during any operation

### Purpose

Provides error information to the client for proper error handling.

### Payload

```javascript
{
  message: string,     // Error message
  code?: string,       // Optional error code
  timestamp: Date      // Error timestamp
}
```

### Common Error Messages

- `"User not found"`
- `"Already in chat or invalid user"`
- `"Cannot join group while in 1-on-1 chat"`
- `"Not in any chat"`
- `"Validation failed: [details]"`

### Example

```javascript
socket.on("error", (error) => {
  console.error("Server error:", error.message);
  showErrorMessage(error.message);
});
```

### Use Cases

- Display error messages to users
- Handle validation failures
- Debug connection issues
- Log client-side errors

---

## ✅ `success`

**Direction**: Server → Client  
**Trigger**: When an operation completes successfully

### Purpose

Confirms successful completion of operations with optional additional data.

### Payload

```javascript
{
  message: string,     // Success message
  data?: Object,       // Optional additional data
  timestamp: Date      // Success timestamp
}
```

### Example

```javascript
socket.on("success", (response) => {
  console.log("Operation successful:", response.message);
  if (response.data) {
    console.log("Additional data:", response.data);
  }
});
```

### Use Cases

- Confirm operation completion
- Provide feedback to users
- Handle successful state changes
- Update UI after operations

---

## 🔄 Connection Flow

### Initial Connection

1. Client establishes WebSocket connection
2. Server creates user instance
3. Server emits `connected` event
4. Server broadcasts updated `activeUsers` count
5. Client receives connection confirmation

### Disconnection Flow

1. Client disconnects (intentional or network issue)
2. Server detects disconnection
3. Server performs cleanup:
   - End active chats
   - Remove from groups
   - Clear waiting queues
   - Delete user data
4. Server broadcasts updated `activeUsers` count
5. Partners/group members notified of departure

---

## 🛠️ Implementation Examples

### Client Connection Setup

```javascript
const socket = io("http://localhost:3000");

socket.on("connected", (data) => {
  console.log("Connected successfully");
  userId = data.userId;

  if (data.requiresProfileSetup) {
    showProfileSetupModal();
  }
});

socket.on("activeUsers", (count) => {
  updateUserCountDisplay(count);
});

socket.on("error", (error) => {
  showErrorNotification(error.message);
});

socket.on("disconnect", () => {
  showDisconnectionMessage();
});
```

### Server Connection Handling

```javascript
io.on("connection", (socket) => {
  // Handled automatically by SocketView.handleConnection()
  console.log(`User connected: ${socket.id}`);
});
```

---

## 📊 Monitoring

### Connection Metrics

- Total connections per time period
- Average connection duration
- Disconnection reasons
- Peak concurrent users

### Error Tracking

- Connection error rates
- Common error messages
- Error resolution times
- Client error patterns

---

## 🔧 Troubleshooting

### Common Issues

**Connection Fails**

- Check server is running
- Verify correct port and URL
- Check firewall settings
- Ensure WebSocket support

**Frequent Disconnections**

- Check network stability
- Verify server resources
- Monitor connection timeouts
- Check client-side error handling

**User Count Inconsistencies**

- Monitor cleanup processes
- Check for memory leaks
- Verify disconnect handling
- Review broadcast logic

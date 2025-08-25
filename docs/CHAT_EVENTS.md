# One-on-One Chat Events Documentation

## Overview

One-on-one chat events handle private conversations between two users, including partner matching, messaging, and session management.

---

## 🚀 `startChat`

**Direction**: Client → Server  
**Trigger**: User wants to start a one-on-one chat

### Purpose

Initiates the process of finding a compatible chat partner and starting a conversation.

### Payload

None

### Server Response Events

- `chatStarted` - If partner found immediately
- `waitingForPartner` - If no partner available
- `error` - If user already in chat or other error

### Example

```javascript
// Client sends
socket.emit("startChat");

// Possible server responses
socket.on("chatStarted", (data) => {
  console.log("Chat started with partner:", data.partnerId);
});

socket.on("waitingForPartner", () => {
  console.log("Waiting for a compatible partner...");
});
```

### Use Cases

- Start new conversation
- Find random chat partner
- Begin matching process

---

## ✨ `chatStarted`

**Direction**: Server → Client  
**Trigger**: When a compatible partner is found and chat session begins

### Purpose

Notifies both users that a chat session has been established with partner information.

### Payload

```javascript
{
  chatId: string,        // Unique chat session ID
  partnerId: string,     // Partner's socket ID
  partnerInfo: {
    name: string,        // Partner's display name or "Anonymous"
    avatar: string|null, // Partner's avatar URL
    gender: string|null, // Partner's gender
    nickname: string|null // Partner's nickname
  }
}
```

### Example

```javascript
socket.on("chatStarted", (data) => {
  console.log("Chat started!");
  console.log("Partner:", data.partnerInfo.name);
  console.log("Chat ID:", data.chatId);

  // Update UI to show chat interface
  showChatInterface(data.partnerInfo);
});
```

### Use Cases

- Display partner information
- Initialize chat interface
- Start conversation UI
- Log chat session start

---

## 💬 `sendMessage`

**Direction**: Client → Server  
**Trigger**: User sends a message in active chat

### Purpose

Sends a message to the chat partner with automatic profanity filtering.

### Payload

```javascript
{
  message: string; // Message content to send
}
```

### Server Processing

1. Validates user is in active chat
2. Applies profanity filtering
3. Logs filtered content if applicable
4. Sends to partner via `messageReceived`

### Example

```javascript
// Client sends message
socket.emit("sendMessage", {
  message: "Hello! How are you today?",
});
```

### Use Cases

- Send text messages
- Real-time conversation
- Content sharing

---

## 📨 `messageReceived`

**Direction**: Server → Client  
**Trigger**: When partner sends a message

### Purpose

Delivers incoming messages from chat partner to the client.

### Payload

```javascript
{
  senderId: string,      // Partner's socket ID
  senderName: string,    // Partner's display name
  senderNickname: string|null, // Partner's nickname
  content: string,       // Message content (filtered)
  timestamp: Date,       // Message timestamp
  isFiltered: boolean,   // Whether content was filtered
  chatId: string        // Chat session ID
}
```

### Example

```javascript
socket.on("messageReceived", (message) => {
  console.log("Message from", message.senderName + ":", message.content);

  // Add message to chat UI
  addMessageToChat({
    sender: message.senderName,
    content: message.content,
    timestamp: message.timestamp,
    isOwn: false,
  });
});
```

### Use Cases

- Display incoming messages
- Update chat history
- Show message timestamps
- Handle filtered content

---

## ⏭️ `skipChat`

**Direction**: Client → Server  
**Trigger**: User wants to skip current partner and find a new one

### Purpose

Ends current chat and immediately starts looking for a new partner.

### Payload

None

### Server Actions

1. End current chat session
2. Notify partner with `chatEnded`
3. Automatically start new partner search
4. Send `chatStarted` or `waitingForPartner`

### Example

```javascript
// Client skips to next partner
socket.emit("skipChat");

// Server will automatically try to find new partner
socket.on("chatStarted", (data) => {
  console.log("New partner found:", data.partnerInfo.name);
});
```

### Use Cases

- Skip incompatible partners
- Find new conversation
- Quick partner switching

---

## 🛑 `endChat`

**Direction**: Client → Server  
**Trigger**: User wants to end current chat session

### Purpose

Terminates the current chat session without starting a new one.

### Payload

None

### Server Actions

1. End chat session
2. Update user status
3. Notify partner with `chatEnded`
4. Clean up chat data

### Example

```javascript
// Client ends chat
socket.emit("endChat");

// No automatic new chat search
console.log("Chat ended by user");
```

### Use Cases

- End conversation
- Return to main menu
- Stop chatting

---

## 🔚 `chatEnded`

**Direction**: Server → Client  
**Trigger**: When partner ends or skips the chat

### Purpose

Notifies user that the chat session has been terminated by their partner.

### Payload

None

### Example

```javascript
socket.on("chatEnded", () => {
  console.log("Partner ended the chat");

  // Update UI to show chat ended
  showChatEndedMessage();

  // Return to main interface
  showMainInterface();
});
```

### Use Cases

- Notify of partner departure
- Update chat interface
- Handle session termination
- Return to main menu

---

## ⏳ `waitingForPartner`

**Direction**: Server → Client  
**Trigger**: When no compatible partner is available

### Purpose

Informs user they are in the waiting queue for partner matching.

### Payload

None

### Example

```javascript
socket.on("waitingForPartner", () => {
  console.log("Waiting for a partner...");

  // Show waiting interface
  showWaitingInterface();

  // Optional: Show loading animation
  startLoadingAnimation();
});
```

### Use Cases

- Show waiting status
- Display loading indicators
- Manage user expectations
- Queue position feedback

---

## 🔄 Chat Flow Diagram

```
User A                    Server                    User B
  |                         |                         |
  |-----> startChat         |                         |
  |                         |-----> findPartner       |
  |                         |                         |
  |<----- waitingForPartner |                         |
  |                         |                         |
  |                         |         startChat <-----|
  |                         |                         |
  |<----- chatStarted       |       chatStarted ----->|
  |                         |                         |
  |-----> sendMessage       |                         |
  |                         |   messageReceived ----->|
  |                         |                         |
  |                         |       sendMessage <-----|
  |<----- messageReceived   |                         |
  |                         |                         |
  |-----> skipChat          |                         |
  |                         |        chatEnded ------>|
  |<----- waitingForPartner |                         |
```

---

## 🛠️ Implementation Examples

### Complete Chat Client

```javascript
class ChatClient {
  constructor() {
    this.socket = io();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on("chatStarted", (data) => {
      this.onChatStarted(data);
    });

    this.socket.on("messageReceived", (message) => {
      this.onMessageReceived(message);
    });

    this.socket.on("chatEnded", () => {
      this.onChatEnded();
    });

    this.socket.on("waitingForPartner", () => {
      this.onWaitingForPartner();
    });
  }

  startChat() {
    this.socket.emit("startChat");
  }

  sendMessage(text) {
    this.socket.emit("sendMessage", { message: text });
  }

  skipChat() {
    this.socket.emit("skipChat");
  }

  endChat() {
    this.socket.emit("endChat");
  }

  onChatStarted(data) {
    console.log("Chat started with:", data.partnerInfo.name);
    // Update UI
  }

  onMessageReceived(message) {
    console.log("Received:", message.content);
    // Add to chat display
  }

  onChatEnded() {
    console.log("Chat ended by partner");
    // Show end message
  }

  onWaitingForPartner() {
    console.log("Waiting for partner...");
    // Show waiting UI
  }
}
```

---

## 📊 Chat Statistics

### Metrics Tracked

- Total chat sessions
- Average chat duration
- Messages per chat
- Skip rate
- Partner matching time

### Performance Indicators

- Matching success rate
- User retention in chats
- Message filtering rate
- Connection stability

---

## 🔧 Troubleshooting

### Common Issues

**Chat Won't Start**

- Check if user already in chat
- Verify profile setup completion
- Check server connection
- Review matching preferences

**Messages Not Sending**

- Verify active chat session
- Check message content length
- Ensure WebSocket connection
- Review profanity filtering

**Partner Not Found**

- Check active user count
- Review matching preferences
- Verify server matching logic
- Check waiting queue status

**Chat Ends Unexpectedly**

- Monitor partner disconnections
- Check network stability
- Review error logs
- Verify cleanup processes

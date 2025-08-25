# Random Chat Server - MVC Architecture

## 🏗️ Architecture Overview

This project has been completely refactored to follow the **Model-View-Controller (MVC)** architectural pattern, making it highly scalable, maintainable, and testable.

## 📁 Project Structure

```
src/
├── models/                 # Data models and business entities
│   ├── User.js            # User entity with profile and preferences
│   ├── Chat.js            # One-on-one chat session model
│   ├── GroupChat.js       # Group chat session model
│   └── Message.js         # Message entity with filtering
│
├── views/                  # Presentation layer (HTTP & WebSocket)
│   ├── SocketView.js      # WebSocket event handling and responses
│   └── HttpView.js        # HTTP request/response handling
│
├── controllers/            # Business logic controllers
│   ├── UserController.js      # User management operations
│   ├── ChatController.js      # One-on-one chat operations
│   └── GroupChatController.js # Group chat operations
│
├── repositories/           # Data access layer
│   ├── UserRepository.js      # User data operations
│   ├── ChatRepository.js      # Chat data operations
│   └── GroupChatRepository.js # Group chat data operations
│
├── services/              # Business services and utilities
│   ├── matchingService.js # User matching logic
│   ├── chatService.js     # Legacy chat service (being phased out)
│   └── groupChatService.js # Legacy group service (being phased out)
│
├── storage/               # Data storage layer
│   └── memoryStorage.js   # In-memory storage implementation
│
├── filters/               # Content filtering
│   └── profanityFilter.js # Message content filtering
│
├── utils/                 # Utility functions
│   └── helpers.js         # Common helper functions
│
└── server.js              # Main server setup and configuration
```

## 🔄 MVC Pattern Implementation

### **Models** (Data Layer)

- **User**: Represents user entities with profiles, preferences, and status
- **Chat**: Manages one-on-one chat sessions between users
- **GroupChat**: Handles group chat sessions with multiple participants
- **Message**: Represents chat messages with filtering and metadata

### **Views** (Presentation Layer)

- **SocketView**: Handles WebSocket connections and real-time communication
- **HttpView**: Manages HTTP requests and REST API responses

### **Controllers** (Business Logic)

- **UserController**: User management, profiles, and preferences
- **ChatController**: One-on-one chat operations and matching
- **GroupChatController**: Group chat management and operations

### **Repositories** (Data Access)

- **UserRepository**: User data CRUD operations
- **ChatRepository**: Chat data persistence and queries
- **GroupChatRepository**: Group chat data management

## 🚀 Key Features

### **Scalability**

- **Modular Architecture**: Each component has a single responsibility
- **Loose Coupling**: Components interact through well-defined interfaces
- **Easy Extension**: New features can be added without affecting existing code

### **Maintainability**

- **Clear Separation**: Business logic separated from presentation and data layers
- **Comprehensive Documentation**: Every class and method is documented
- **Consistent Patterns**: Standardized approach across all components

### **Testability**

- **Dependency Injection**: Controllers can be easily mocked for testing
- **Pure Functions**: Business logic functions are testable in isolation
- **Repository Pattern**: Data access can be easily stubbed

## 📊 API Endpoints

### **Health & Statistics**

```
GET /                    # Server information and statistics
GET /health             # Health check endpoint
GET /api/stats          # Comprehensive statistics
GET /api/stats/users    # User statistics
GET /api/stats/chats    # Chat statistics
GET /api/stats/groups   # Group chat statistics
```

### **User Information**

```
GET /api/users/count    # Active user count
GET /api/users/active   # Active users information
```

### **Admin Endpoints**

```
GET /api/admin/cleanup      # Perform system cleanup
GET /api/admin/system-info  # System information
```

## 🔌 WebSocket Events

### **Connection Events**

- `connected` - User connection confirmation
- `disconnect` - User disconnection

### **One-on-One Chat Events**

- `startChat` - Start looking for chat partner
- `sendMessage` - Send message in chat
- `endChat` - End current chat
- `skipChat` - Skip to next chat partner
- `chatStarted` - Chat session started
- `messageReceived` - Message received from partner
- `chatEnded` - Chat session ended
- `waitingForPartner` - Waiting for compatible partner

### **Group Chat Events**

- `joinGroup` - Join group chat
- `sendGroupMessage` - Send message to group
- `endGroupChat` - Leave group chat
- `groupJoined` - Successfully joined group
- `groupMessageReceived` - Message received in group
- `userJoinedGroup` - User joined the group
- `userLeftGroup` - User left the group
- `groupLeft` - Successfully left group

### **Profile Events**

- `manageProfile` - Update user profile
- `getProfile` - Get user profile data
- `profileUpdated` - Profile update confirmation
- `profileData` - Profile data response

### **Preference Events**

- `setGenderPreference` - Set gender preference
- `removeGenderPreference` - Remove gender preference
- `genderPreferenceUpdated` - Preference update confirmation

### **Utility Events**

- `getActiveUsers` - Get active user count
- `getStats` - Get server statistics
- `getGroupStats` - Get group statistics
- `activeUsers` - Active user count response
- `serverStats` - Server statistics response
- `groupStats` - Group statistics response

## 🛠️ Development

### **Starting the Server**

```bash
npm start          # Production mode
npm run dev        # Development mode with auto-restart
```

### **Environment Variables**

```bash
PORT=3000          # Server port (default: 3000)
NODE_ENV=production # Environment mode
```

### **Adding New Features**

1. **Create Model** (if needed)

   ```javascript
   // src/models/NewModel.js
   class NewModel {
     constructor() {
       // Model implementation
     }
   }
   ```

2. **Create Repository** (if needed)

   ```javascript
   // src/repositories/NewRepository.js
   class NewRepository {
     // Data access methods
   }
   ```

3. **Create Controller**

   ```javascript
   // src/controllers/NewController.js
   class NewController {
     // Business logic methods
   }
   ```

4. **Update Views**
   ```javascript
   // Add new endpoints to HttpView.js
   // Add new socket events to SocketView.js
   ```

## 📈 Performance & Monitoring

### **Built-in Monitoring**

- Real-time user statistics
- Chat session metrics
- Memory usage tracking
- Performance monitoring endpoints

### **Logging**

- Request/response logging
- Error tracking
- User activity logging
- System event logging

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Profanity Filtering**: Automatic content filtering for messages
- **XSS Protection**: Input sanitization prevents XSS attacks
- **Error Handling**: Graceful error handling without exposing internals

## 🧪 Testing

The MVC architecture makes testing straightforward:

```javascript
// Example unit test for UserController
const UserController = require("../src/controllers/UserController");

describe("UserController", () => {
  it("should create a new user", () => {
    const controller = new UserController();
    const user = controller.createUser("test-socket-id");
    expect(user).toBeDefined();
    expect(user.socketId).toBe("test-socket-id");
  });
});
```

## 🚀 Deployment

### **Production Considerations**

- Use process managers like PM2
- Implement proper logging (Winston, etc.)
- Add database persistence layer
- Implement Redis for scaling across multiple servers
- Add rate limiting and DDoS protection

### **Scaling**

The MVC architecture makes horizontal scaling easier:

- Replace memory storage with Redis/Database
- Add load balancers for multiple server instances
- Implement microservices for different components

## 📝 Migration from Legacy Code

The refactoring maintains backward compatibility while introducing the new architecture:

1. **Legacy functions** are marked as deprecated
2. **Gradual migration** path from old to new patterns
3. **Comprehensive documentation** for the transition
4. **No breaking changes** to existing WebSocket events

## 🤝 Contributing

1. Follow the MVC pattern for new features
2. Add comprehensive documentation
3. Include unit tests for new controllers
4. Update this README for significant changes

---

**The MVC architecture makes this chat server highly scalable, maintainable, and ready for production use!** 🎉

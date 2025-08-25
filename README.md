# Random Chat Server - MVC Architecture

## 🚀 Overview

A modern, scalable WebSocket-based chat server built with **MVC architecture** that enables real-time one-on-one and group conversations between users. Features intelligent matching, content filtering, and comprehensive monitoring.

## ✨ Key Features

- **Real-Time Communication**: WebSocket-based instant messaging
- **One-on-One Chat**: Private conversations with intelligent partner matching
- **Group Chat**: Multi-user rooms (up to 6 participants)
- **Smart Matching**: Gender preference-based partner matching
- **Content Filtering**: Multi-language profanity filtering (English & Hindi)
- **User Profiles**: Customizable profiles with avatars and nicknames
- **Live Statistics**: Real-time monitoring and analytics
- **MVC Architecture**: Scalable, maintainable codebase

## 🏗️ Architecture

Built using the **Model-View-Controller (MVC)** pattern for maximum scalability and maintainability:

- **Models**: Data entities (User, Chat, GroupChat, Message)
- **Views**: Presentation layer (SocketView, HttpView)
- **Controllers**: Business logic (UserController, ChatController, GroupChatController)
- **Repositories**: Data access layer with CRUD operations

## 📁 Project Structure

```
├── docs/                   # Comprehensive documentation
│   ├── APP_OVERVIEW.md     # Application overview and features
│   ├── CONNECTION_EVENTS.md # Connection event documentation
│   ├── CHAT_EVENTS.md      # One-on-one chat events
│   ├── GROUP_CHAT_EVENTS.md # Group chat events
│   ├── PROFILE_EVENTS.md   # Profile management events
│   ├── STATISTICS_EVENTS.md # Statistics and monitoring
│   └── API_ENDPOINTS.md    # HTTP API documentation
├── src/
│   ├── models/             # Data models
│   ├── views/              # Presentation layer
│   ├── controllers/        # Business logic
│   ├── repositories/       # Data access
│   ├── services/           # Business services
│   ├── storage/            # Data storage
│   ├── filters/            # Content filtering
│   ├── utils/              # Utilities
│   └── server.js           # Main server
├── index.js                # Application entry point
├── package.json            # Dependencies
└── MVC_README.md          # Detailed MVC documentation
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
npm start          # Production mode
npm run dev        # Development mode with auto-restart
```

### Access Points

- **WebSocket**: `ws://localhost:3000`
- **HTTP API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **Statistics**: `http://localhost:3000/api/stats`

## 📚 Documentation

### Event Documentation

- **[Connection Events](docs/CONNECTION_EVENTS.md)** - Connection lifecycle and user management
- **[Chat Events](docs/CHAT_EVENTS.md)** - One-on-one chat functionality
- **[Group Chat Events](docs/GROUP_CHAT_EVENTS.md)** - Group chat operations
- **[Profile Events](docs/PROFILE_EVENTS.md)** - User profile management
- **[Statistics Events](docs/STATISTICS_EVENTS.md)** - Real-time monitoring

### API Documentation

- **[HTTP API Endpoints](docs/API_ENDPOINTS.md)** - REST API reference
- **[App Overview](docs/APP_OVERVIEW.md)** - Comprehensive application guide

### Architecture Documentation

- **[MVC Architecture](MVC_README.md)** - Detailed architecture documentation

## 🔌 WebSocket Events

### Connection Events

- `connected` - Connection confirmation
- `disconnect` - User disconnection
- `activeUsers` - Real-time user count
- `error` - Error notifications

### Chat Events

- `startChat` - Start partner search
- `chatStarted` - Chat session began
- `sendMessage` - Send message
- `messageReceived` - Receive message
- `skipChat` - Skip to next partner
- `endChat` - End current chat
- `chatEnded` - Partner ended chat
- `waitingForPartner` - Waiting for match

### Group Chat Events

- `joinGroup` - Join group chat
- `groupJoined` - Successfully joined
- `sendGroupMessage` - Send group message
- `groupMessageReceived` - Receive group message
- `userJoinedGroup` - User joined notification
- `userLeftGroup` - User left notification
- `endGroupChat` - Leave group
- `groupLeft` - Successfully left

### Profile Events

- `manageProfile` - Update profile
- `profileUpdated` - Profile update confirmation
- `getProfile` - Request profile data
- `profileData` - Profile data response
- `setGenderPreference` - Set matching preference
- `removeGenderPreference` - Remove preference
- `genderPreferenceUpdated` - Preference update confirmation

## 🌐 HTTP API Endpoints

### Core Endpoints

- `GET /` - Server information and statistics
- `GET /health` - Health check and system metrics
- `GET /api/stats` - Comprehensive statistics
- `GET /api/users/count` - Active user count
- `GET /api/users/active` - Active users information

### Statistics Endpoints

- `GET /api/stats/users` - User statistics
- `GET /api/stats/chats` - Chat statistics
- `GET /api/stats/groups` - Group chat statistics

### Admin Endpoints

- `GET /api/admin/cleanup` - System cleanup
- `GET /api/admin/system-info` - System information

## 🛠️ Client Implementation Example

```javascript
const socket = io("http://localhost:3000");

// Connection handling
socket.on("connected", (data) => {
  console.log("Connected:", data.userId);
  if (data.requiresProfileSetup) {
    showProfileSetup();
  }
});

// Start one-on-one chat
socket.emit("startChat");

socket.on("chatStarted", (data) => {
  console.log("Chat started with:", data.partnerInfo.name);
  showChatInterface(data.partnerInfo);
});

// Send message
socket.emit("sendMessage", { message: "Hello!" });

socket.on("messageReceived", (message) => {
  displayMessage(message.senderName, message.content);
});

// Join group chat
socket.emit("joinGroup");

socket.on("groupJoined", (data) => {
  console.log("Joined group:", data.groupId);
  showGroupInterface(data.groupInfo);
});

// Update profile
socket.emit("manageProfile", {
  name: "John Doe",
  gender: "male",
  avatar: "avatar_url",
});
```

## 📊 Monitoring & Analytics

### Real-time Metrics

- Active user count
- Chat session statistics
- Group utilization
- Message throughput
- System performance

### Built-in Dashboard

Access comprehensive statistics at `/api/stats` for:

- User engagement metrics
- Chat performance data
- Group activity analysis
- System health monitoring

## 🔒 Security Features

- **Input Validation**: All user inputs validated and sanitized
- **XSS Protection**: Comprehensive input sanitization
- **Content Filtering**: Multi-language profanity detection
- **Error Handling**: Secure error responses
- **Rate Limiting**: Built-in protection against abuse

## 🚀 Production Deployment

### Environment Variables

```bash
PORT=3000              # Server port
NODE_ENV=production    # Environment mode
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Checks

```bash
# Docker health check
curl -f http://localhost:3000/health || exit 1

# Kubernetes liveness probe
curl -f http://localhost:3000/health
```

## 🔧 Development

### Adding New Features

1. **Create Model** (if needed)
2. **Create Repository** for data access
3. **Create Controller** for business logic
4. **Update Views** for presentation
5. **Add Documentation**

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📈 Scaling

The MVC architecture enables easy scaling:

- **Horizontal Scaling**: Multiple server instances with load balancing
- **Database Integration**: Replace memory storage with persistent databases
- **Redis Integration**: Distributed session management
- **Microservices**: Split components into separate services

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow MVC patterns for new code
4. Add comprehensive documentation
5. Include unit tests
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Architecture**: See `MVC_README.md` for detailed architecture information

---

**Built with ❤️ using Node.js, Socket.IO, and MVC Architecture**

# Source Code Structure

This directory contains the refactored and organized source code for the Random Chat Server.

## Directory Structure

```
src/
├── server.js              # Main server class and configuration
├── handlers/
│   └── socketHandler.js   # Socket.IO event handling
├── services/
│   ├── chatService.js     # Chat management and messaging
│   └── matchingService.js # User matching and compatibility
├── storage/
│   └── memoryStorage.js   # In-memory data storage
├── filters/
│   └── profanityFilter.js # Message content filtering
└── utils/
    └── helpers.js         # Utility functions
```

## Module Descriptions

### `server.js`

- Main server entry point
- Sets up Express and Socket.IO
- Configures middleware and routes
- Initializes socket handlers

### `handlers/socketHandler.js`

- Manages all WebSocket connections
- Handles socket events (connect, disconnect, chat events)
- Coordinates between services for user actions

### `services/chatService.js`

- Manages chat sessions and rooms
- Handles message routing and filtering
- Controls chat lifecycle (start, end, skip)

### `services/matchingService.js`

- Finds compatible chat partners
- Handles gender preference matching
- Manages waiting list for users

### `storage/memoryStorage.js`

- Centralized in-memory data storage
- User profiles, chat rooms, and session data
- Helper functions for data operations

### `filters/profanityFilter.js`

- Content filtering for inappropriate language
- Supports English and Hindi (romanized)
- Handles common bypass attempts

### `utils/helpers.js`

- Common utility functions
- Input validation and sanitization
- Helper functions for various operations

## Key Features

- **Modular Architecture**: Each component has a single responsibility
- **Comprehensive Comments**: Every function and class is documented
- **Error Handling**: Proper error handling throughout the codebase
- **Scalable Design**: Easy to extend with new features
- **Clean Separation**: Business logic separated from presentation layer

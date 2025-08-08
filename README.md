# Random Chat Server

A WebSocket-based chat server that connects random strangers for anonymous conversations using Socket.IO.

## Features

- **Random Matching**: Connects users with random strangers instantly
- **Smart Matching**: Optional preference-based matching system
- **Profile System**: Optional user profiles with age, gender, interests, and location
- **Gender Preferences**: Filter matches by preferred gender
- **Age Range Filtering**: Set preferred age range for matches
- **Location Matching**: Option to match with users from same location
- **Interest-based Matching**: Find users with common interests
- **Real-time Messaging**: Instant message delivery using WebSockets
- **Parallel Chats**: Multiple chat sessions can run simultaneously
- **Chat Controls**: Start, end, and skip chats seamlessly
- **Active Users Tracking**: Real-time online user count updates
- **Memory Storage**: Uses in-memory storage (no database required)
- **Auto-matching**: Skip feature automatically finds new partners
- **Profanity Filter**: Automatically filters inappropriate words in Hindi and English

## Server Events

### Client to Server Events

| Event                    | Description                                        | Payload                                               |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------- | -------- | -------- |
| `startChat`              | Request to start a new chat with a random stranger | None                                                  |
| `sendMessage`            | Send a message in current chat                     | `{ message: string }`                                 |
| `endChat`                | End the current chat                               | None                                                  |
| `skipChat`               | End current chat and start looking for new partner | None                                                  |
| `getActiveUsers`         | Request current active users count                 | None                                                  |
| `manageProfile`          | Setup or update user profile (single event)        | `{ name?: string, gender?: string, avatar?: string }` |
| `setGenderPreference`    | Set gender matching preference                     | `{ preferredGender: 'male'                            | 'female' | 'any' }` |
| `removeGenderPreference` | Remove gender preference (set to 'any')            | None                                                  |
| `getProfile`             | Get current user profile and preferences           | None                                                  |

### Server to Client Events

| Event                     | Description                              | Payload                                                                        |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `connected`               | User successfully connected to server    | `{ userId: string, timestamp: Date, requiresProfileSetup: boolean }`           |
| `chatStarted`             | Chat successfully started with a partner | `{ chatId: string, partnerId: string, partnerInfo: { name, avatar, gender } }` |
| `waitingForPartner`       | Added to waiting queue                   | None                                                                           |
| `messageReceived`         | New message from chat partner            | `{ senderId: string, message: string, timestamp: Date }`                       |
| `chatEnded`               | Current chat has ended                   | None                                                                           |
| `activeUsers`             | Current number of active users           | `number`                                                                       |
| `profileUpdated`          | Profile setup/update completed           | `{ profile: object, message: string }`                                         |
| `genderPreferenceUpdated` | Gender preference updated                | `{ preferences: object, message: string }`                                     |
| `profileData`             | Current profile and preferences data     | `{ profile: object, preferences: object }`                                     |
| `error`                   | Error message                            | `string`                                                                       |

## Running the Server Locally

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

3. **Server will be running on:**
   - HTTP: `http://localhost:3000`
   - WebSocket: `ws://localhost:3000`

### Health Check

Visit `http://localhost:3000` to see server status and statistics.

## Profile & Preferences System

### Optional Profile Setup

After connecting, users can optionally set up their profile using a single `manageProfile` event:

- **Name**: Display name shown to chat partners
- **Gender**: 'male', 'female', or other
- **Avatar**: Profile picture URL

### Gender Preferences

Users can set gender preferences for matching:

- **'male'**: Match only with male users
- **'female'**: Match only with female users
- **'any'**: Match with anyone (default)
- **Remove preference**: Use `removeGenderPreference` to reset to 'any'

### Matching Algorithm

The server uses a simple compatibility system that considers:

1. **Mutual gender preferences** - Both users' gender preferences must be satisfied

If no compatible match is found, users are added to the waiting queue for the next available partner.

## App Flow

1. **User opens app** → Connects to server automatically
2. **Gets connection event** → Server assigns unique socket ID and sends connection confirmation
3. **Optional profile setup** → User can set up profile or skip (can be done later in settings)
4. **Optional preferences** → User can set chat preferences or use defaults
5. **Gets online count** → Receives real-time active user updates
6. **Hits "Start Chat"** → Server uses socket ID and preferences for matching
7. **Smart matching process**:
   - Server finds compatible partner based on preferences
   - If compatible user waiting → Instant match, chat starts
   - If no compatible users → Added to queue, waits for compatible partner
   - Multiple chats run in parallel
8. **In chat**: Send/receive messages in real-time
9. **Chat controls**:
   - **Stop** → Ends current chat, returns to main screen
   - **Skip** → Ends current chat, automatically finds new compatible partner
10. **Settings** → User can update profile and preferences anytime
11. **Repeat** → User can start new chats anytime

## Flutter Integration

### 1. Add Socket.IO Client Dependency

Add to your `pubspec.yaml`:

```yaml
dependencies:
  socket_io_client: ^2.0.3+1
```

### 2. Flutter Implementation Example

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatService {
  late IO.Socket socket;
  String? tempUserId;

  void initSocket() {
    socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.connect();

    // Listen for connection confirmation
    socket.on('connected', (data) {
      tempUserId = data['userId'];
      print('Connected to server with ID: $tempUserId');
      print('Requires profile setup: ${data['requiresProfileSetup']}');
      // Get initial active users count
      getActiveUsers();
    });

    // Listen for chat started
    socket.on('chatStarted', (data) {
      print('Chat started with partner: ${data['partnerId']}');
      // Update UI to show chat interface
    });

    // Listen for messages
    socket.on('messageReceived', (data) {
      print('Message: ${data['message']}');
      // Add message to chat UI
    });

    // Listen for chat ended (no reason provided)
    socket.on('chatEnded', (_) {
      print('Chat ended');
      // Update UI to show chat ended, return to main screen
    });

    // Listen for active users count (real-time updates)
    socket.on('activeUsers', (count) {
      print('Active users: $count');
      // Update UI with user count
    });

    // Listen for waiting status
    socket.on('waitingForPartner', (_) {
      print('Waiting for partner...');
      // Show waiting UI
    });
  }

  // Start chat - no need to send ID
  void startChat() {
    socket.emit('startChat');
  }

  void sendMessage(String message) {
    socket.emit('sendMessage', {'message': message});
  }

  // Stop chat - ends and returns to main
  void endChat() {
    socket.emit('endChat');
  }

  // Skip chat - ends current and finds new partner automatically
  void skipChat() {
    socket.emit('skipChat');
  }

  void getActiveUsers() {
    socket.emit('getActiveUsers');
  }

  // Profile management (single method for setup/update)
  void manageProfile({
    String? name,
    String? gender,
    String? avatar
  }) {
    socket.emit('manageProfile', {
      if (name != null) 'name': name,
      if (gender != null) 'gender': gender,
      if (avatar != null) 'avatar': avatar,
    });
  }

  // Gender preference methods
  void setGenderPreference(String preferredGender) {
    socket.emit('setGenderPreference', {
      'preferredGender': preferredGender, // 'male', 'female', 'any'
    });
  }

  void removeGenderPreference() {
    socket.emit('removeGenderPreference');
  }

  void getProfile() {
    socket.emit('getProfile');
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

### 3. Flutter UI Example

```dart
class ChatScreen extends StatefulWidget {
  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ChatService _chatService = ChatService();
  final TextEditingController _messageController = TextEditingController();
  List<Map<String, dynamic>> messages = [];
  bool isInChat = false;
  bool isWaiting = false;
  int activeUsers = 0;

  @override
  void initState() {
    super.initState();
    _chatService.initSocket();

    // Setup listeners
    _chatService.socket.on('chatStarted', (data) {
      setState(() {
        isInChat = true;
        isWaiting = false;
        messages.clear();
      });
    });

    _chatService.socket.on('messageReceived', (data) {
      setState(() {
        messages.add({
          'message': data['message'],
          'isMe': false,
          'timestamp': DateTime.now(),
        });
      });
    });

    _chatService.socket.on('chatEnded', (_) {
      setState(() {
        isInChat = false;
        isWaiting = false;
      });
    });

    _chatService.socket.on('waitingForPartner', (_) {
      setState(() {
        isWaiting = true;
      });
    });

    _chatService.socket.on('activeUsers', (count) {
      setState(() {
        activeUsers = count;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Random Chat'),
        actions: [
          Text('Users: $activeUsers'),
          SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          // Chat controls
          Padding(
            padding: EdgeInsets.all(8.0),
            child: Row(
              children: [
                ElevatedButton(
                  onPressed: isInChat || isWaiting ? null : () {
                    _chatService.startChat();
                  },
                  child: Text('Start Chat'),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: !isInChat ? null : () {
                    _chatService.endChat();
                  },
                  child: Text('End Chat'),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: !isInChat ? null : () {
                    _chatService.skipChat();
                  },
                  child: Text('Skip'),
                ),
              ],
            ),
          ),

          // Status
          if (isWaiting)
            Container(
              padding: EdgeInsets.all(16),
              child: Text('Waiting for partner...'),
            ),

          // Messages
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[index];
                return ListTile(
                  title: Text(message['message']),
                  subtitle: Text(message['isMe'] ? 'You' : 'Stranger'),
                );
              },
            ),
          ),

          // Message input
          if (isInChat)
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      if (_messageController.text.isNotEmpty) {
                        _chatService.sendMessage(_messageController.text);
                        setState(() {
                          messages.add({
                            'message': _messageController.text,
                            'isMe': true,
                            'timestamp': DateTime.now(),
                          });
                        });
                        _messageController.clear();
                      }
                    },
                    icon: Icon(Icons.send),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _chatService.disconnect();
    super.dispose();
  }
}
```

## Server Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)

### CORS Configuration

The server is configured to accept connections from any origin. For production, update the CORS settings in `index.js`:

```javascript
const io = socketIo(server, {
  cors: {
    origin: "your-flutter-app-domain.com",
    methods: ["GET", "POST"],
  },
});
```

## Architecture

### Memory Storage Structure

- **users**: Map of connected users (socketId -> user info)
- **waitingUsers**: Set of users waiting for chat partners
- **activeChats**: Map of active chat sessions (chatId -> chat info)
- **chatRooms**: Map of user to chat room mapping (socketId -> chatId)

### Chat Flow

1. User connects to server
2. User requests to start chat
3. Server either matches with waiting user or adds to waiting queue
4. When matched, both users join a chat room
5. Messages are exchanged in real-time
6. Chat can be ended or skipped by either user
7. Users can start new chats after ending current one

## Testing

You can test the server using any WebSocket client or the provided Flutter example. The server also provides a REST endpoint at `/` for basic health checks.

## Profanity Filter

The server includes an automatic profanity filter that:

- **Filters both Hindi and English** inappropriate words
- **Replaces bad words with stars** (e.g., "badword" becomes "\*\*\*\*")
- **Handles bypass attempts** like spacing letters (e.g., "b a d w o r d")
- **Supports variations** with numbers/symbols (e.g., "b@dw0rd")
- **Logs filtered messages** for monitoring purposes
- **Works in real-time** during message sending

### Filter Coverage:

- **English**: Common profanity, slurs, and inappropriate terms
- **Hindi**: Romanized Hindi curse words and inappropriate terms
- **Bypass protection**: Handles spaced letters and character substitutions

The filter automatically processes all messages before sending them to chat partners, ensuring a cleaner chat experience.

## Production Considerations

- Add rate limiting for message sending
- Implement user authentication if needed
- Expand profanity filter word lists as needed
- Consider using Redis for scaling across multiple server instances
- Add logging and monitoring
- Implement proper error handling and reconnection logic
- Add user reporting system for inappropriate behavior

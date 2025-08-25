# HTTP API Endpoints Documentation

## Overview

The Random Chat Server provides RESTful HTTP endpoints for monitoring, statistics, and administrative functions. These endpoints complement the WebSocket events and provide external access to server data.

---

## 🏠 Root Endpoint

### `GET /`

**Purpose**: Server information and comprehensive statistics overview

**Authentication**: None required

**Response Format**: JSON

**Response Schema**:

```javascript
{
  message: string,           // Server status message
  version: string,           // Server version
  architecture: string,      // Architecture type (MVC)
  timestamp: Date,           // Response timestamp
  users: {
    total: number,           // Total active users
    active: number,          // Currently active users
    inChat: number,          // Users in one-on-one chats
    inGroup: number,         // Users in group chats
    available: number,       // Available users
    completedProfiles: number // Users with complete profiles
  },
  chats: {
    active: number,          // Active chat sessions
    completed: number,       // Completed chats
    waiting: number,         // Users waiting for partners
    totalMessages: number    // Total messages sent
  },
  groups: {
    total: number,           // Total groups
    active: number,          // Active groups
    totalMembers: number,    // Total group members
    availableSlots: number,  // Available group slots
    maxGroupSize: number     // Maximum group size
  }
}
```

**Example Request**:

```bash
curl http://localhost:3000/
```

**Example Response**:

```json
{
  "message": "Random Chat Server is running",
  "version": "2.0.0",
  "architecture": "MVC",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "users": {
    "total": 150,
    "active": 150,
    "inChat": 45,
    "inGroup": 32,
    "available": 73,
    "completedProfiles": 120
  },
  "chats": {
    "active": 22,
    "completed": 1250,
    "waiting": 8,
    "totalMessages": 15420
  },
  "groups": {
    "total": 8,
    "active": 6,
    "totalMembers": 32,
    "availableSlots": 4,
    "maxGroupSize": 6
  }
}
```

**Use Cases**:

- Quick server overview
- Dashboard display
- Health monitoring
- Status page integration

---

## 🏥 Health Check

### `GET /health`

**Purpose**: Server health status and system metrics

**Authentication**: None required

**Response Format**: JSON

**Response Schema**:

```javascript
{
  status: string,            // "healthy" or "unhealthy"
  timestamp: Date,           // Health check timestamp
  uptime: number,            // Server uptime in seconds
  memory: {
    rss: number,             // Resident Set Size
    heapTotal: number,       // Total heap size
    heapUsed: number,        // Used heap size
    external: number         // External memory usage
  },
  activeUsers: number,       // Current active users
  version: string            // Server version
}
```

**Example Request**:

```bash
curl http://localhost:3000/health
```

**Example Response**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "memory": {
    "rss": 67108864,
    "heapTotal": 33554432,
    "heapUsed": 25165824,
    "external": 2097152
  },
  "activeUsers": 150,
  "version": "2.0.0"
}
```

**HTTP Status Codes**:

- `200 OK`: Server is healthy
- `500 Internal Server Error`: Server is unhealthy

**Use Cases**:

- Load balancer health checks
- Monitoring system integration
- Automated health monitoring
- System diagnostics

---

## 📊 Statistics Endpoints

### `GET /api/stats`

**Purpose**: Comprehensive server statistics

**Authentication**: None required

**Response Format**: JSON

**Response Schema**:

```javascript
{
  users: {
    total: number,
    completedProfiles: number,
    usersInChat: number,
    usersInGroup: number,
    availableUsers: number
  },
  chats: {
    totalChats: number,
    activeChats: number,
    completedChats: number,
    totalMessages: number,
    averageDuration: number,
    waitingUsers: number
  },
  groups: {
    totalGroups: number,
    activeGroups: number,
    totalMembers: number,
    availableSlots: number,
    maxGroupSize: number,
    averageGroupSize: number
  },
  timestamp: Date,
  server: {
    uptime: number,
    memory: Object,
    version: string,
    architecture: string
  }
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/stats
```

**Use Cases**:

- Analytics dashboard
- Performance monitoring
- Capacity planning
- Usage analysis

---

### `GET /api/stats/users`

**Purpose**: User-specific statistics

**Authentication**: None required

**Response Schema**:

```javascript
{
  total: number,
  completedProfiles: number,
  usersInChat: number,
  usersInGroup: number,
  availableUsers: number,
  recentlyConnected: number,
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/stats/users
```

**Use Cases**:

- User analytics
- Profile completion tracking
- User engagement metrics
- Activity monitoring

---

### `GET /api/stats/chats`

**Purpose**: Chat-specific statistics

**Authentication**: None required

**Response Schema**:

```javascript
{
  totalChats: number,
  activeChats: number,
  completedChats: number,
  totalMessages: number,
  averageMessages: number,
  averageDuration: number,
  longestChat: number,
  shortestChat: number,
  waitingUsers: number,
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/stats/chats
```

**Use Cases**:

- Chat performance analysis
- Message throughput monitoring
- User engagement tracking
- Matching efficiency analysis

---

### `GET /api/stats/groups`

**Purpose**: Group chat statistics

**Authentication**: None required

**Response Schema**:

```javascript
{
  totalGroups: number,
  activeGroups: number,
  available: number,
  empty: number,
  full: number,
  totalMembers: number,
  totalMessages: number,
  averageGroupSize: number,
  averageMessages: number,
  maxGroupSize: number,
  availableSlots: number,
  largestGroup: number,
  smallestActiveGroup: number,
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/stats/groups
```

**Use Cases**:

- Group usage analysis
- Capacity monitoring
- Group performance metrics
- Feature optimization

---

## 👥 User Endpoints

### `GET /api/users/count`

**Purpose**: Current active user count

**Authentication**: None required

**Response Schema**:

```javascript
{
  count: number,
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/users/count
```

**Example Response**:

```json
{
  "count": 150,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Use Cases**:

- Simple user count display
- Activity indicators
- Load monitoring
- Capacity tracking

---

### `GET /api/users/active`

**Purpose**: Active users information (anonymized)

**Authentication**: None required

**Response Schema**:

```javascript
{
  users: [
    {
      id: string,              // Anonymized user ID
      connectedAt: Date,       // Connection timestamp
      isInChat: boolean,       // In one-on-one chat
      isInGroup: boolean,      // In group chat
      profileComplete: boolean // Profile completion status
    }
  ],
  count: number,
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/users/active
```

**Use Cases**:

- User activity analysis
- Connection pattern monitoring
- Profile completion tracking
- System load analysis

---

## 🔧 Admin Endpoints

### `GET /api/admin/cleanup`

**Purpose**: Perform system cleanup operations

**Authentication**: None required (should be secured in production)

**Response Schema**:

```javascript
{
  message: string,
  results: {
    chatsCleanedUp: number,
    groupsCleanedUp: number,
    timestamp: Date
  }
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/admin/cleanup
```

**Example Response**:

```json
{
  "message": "Cleanup completed successfully",
  "results": {
    "chatsCleanedUp": 15,
    "groupsCleanedUp": 3,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Operations Performed**:

- Remove inactive chats older than 24 hours
- Delete empty groups
- Clean up orphaned data
- Optimize memory usage

**Use Cases**:

- Scheduled maintenance
- Manual cleanup operations
- System optimization
- Resource management

---

### `GET /api/admin/system-info`

**Purpose**: Detailed system information

**Authentication**: None required (should be secured in production)

**Response Schema**:

```javascript
{
  system: {
    nodeVersion: string,
    platform: string,
    arch: string,
    uptime: number,
    pid: number
  },
  memory: {
    rss: string,
    heapTotal: string,
    heapUsed: string,
    external: string
  },
  server: {
    version: string,
    architecture: string,
    features: string[]
  },
  timestamp: Date
}
```

**Example Request**:

```bash
curl http://localhost:3000/api/admin/system-info
```

**Example Response**:

```json
{
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "arch": "x64",
    "uptime": 86400,
    "pid": 12345
  },
  "memory": {
    "rss": "64 MB",
    "heapTotal": "32 MB",
    "heapUsed": "24 MB",
    "external": "2 MB"
  },
  "server": {
    "version": "2.0.0",
    "architecture": "MVC Pattern",
    "features": [
      "One-on-one chat",
      "Group chat",
      "User profiles",
      "Gender preferences",
      "Profanity filtering",
      "Real-time statistics"
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Use Cases**:

- System monitoring
- Performance analysis
- Debugging information
- Infrastructure management

---

## ❌ Error Handling

### 404 Not Found

**Response Schema**:

```javascript
{
  error: string,
  message: string,
  availableEndpoints: string[],
  timestamp: Date
}
```

**Example Response**:

```json
{
  "error": "Endpoint not found",
  "message": "The endpoint GET /invalid does not exist",
  "availableEndpoints": [
    "GET /",
    "GET /health",
    "GET /api/stats",
    "GET /api/stats/users",
    "GET /api/stats/chats",
    "GET /api/stats/groups",
    "GET /api/users/count",
    "GET /api/users/active"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 500 Internal Server Error

**Response Schema**:

```javascript
{
  error: string,
  message: string,
  timestamp: Date
}
```

**Example Response**:

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🛠️ Implementation Examples

### API Client Class

```javascript
class ChatServerAPI {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
  }

  async getServerInfo() {
    const response = await fetch(`${this.baseURL}/`);
    return await response.json();
  }

  async getHealth() {
    const response = await fetch(`${this.baseURL}/health`);
    return await response.json();
  }

  async getStats() {
    const response = await fetch(`${this.baseURL}/api/stats`);
    return await response.json();
  }

  async getUserStats() {
    const response = await fetch(`${this.baseURL}/api/stats/users`);
    return await response.json();
  }

  async getChatStats() {
    const response = await fetch(`${this.baseURL}/api/stats/chats`);
    return await response.json();
  }

  async getGroupStats() {
    const response = await fetch(`${this.baseURL}/api/stats/groups`);
    return await response.json();
  }

  async getUserCount() {
    const response = await fetch(`${this.baseURL}/api/users/count`);
    return await response.json();
  }

  async getActiveUsers() {
    const response = await fetch(`${this.baseURL}/api/users/active`);
    return await response.json();
  }

  async performCleanup() {
    const response = await fetch(`${this.baseURL}/api/admin/cleanup`);
    return await response.json();
  }

  async getSystemInfo() {
    const response = await fetch(`${this.baseURL}/api/admin/system-info`);
    return await response.json();
  }
}
```

### Monitoring Dashboard

```javascript
class MonitoringDashboard {
  constructor() {
    this.api = new ChatServerAPI();
    this.updateInterval = 30000; // 30 seconds
    this.startMonitoring();
  }

  async startMonitoring() {
    await this.updateDashboard();
    setInterval(() => this.updateDashboard(), this.updateInterval);
  }

  async updateDashboard() {
    try {
      const [serverInfo, health, stats] = await Promise.all([
        this.api.getServerInfo(),
        this.api.getHealth(),
        this.api.getStats(),
      ]);

      this.updateServerInfo(serverInfo);
      this.updateHealthStatus(health);
      this.updateStatistics(stats);
    } catch (error) {
      console.error("Dashboard update failed:", error);
      this.showError("Failed to update dashboard");
    }
  }

  updateServerInfo(info) {
    document.getElementById("serverVersion").textContent = info.version;
    document.getElementById("serverArchitecture").textContent =
      info.architecture;
    document.getElementById("totalUsers").textContent = info.users.total;
  }

  updateHealthStatus(health) {
    const statusElement = document.getElementById("healthStatus");
    statusElement.textContent = health.status;
    statusElement.className =
      health.status === "healthy" ? "healthy" : "unhealthy";

    document.getElementById("uptime").textContent = this.formatUptime(
      health.uptime
    );
    document.getElementById("memoryUsage").textContent = this.formatMemory(
      health.memory.heapUsed
    );
  }

  updateStatistics(stats) {
    // Update user statistics
    document.getElementById("activeChats").textContent =
      stats.chats.activeChats;
    document.getElementById("activeGroups").textContent =
      stats.groups.activeGroups;
    document.getElementById("totalMessages").textContent =
      stats.chats.totalMessages;

    // Update charts/graphs
    this.updateCharts(stats);
  }

  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  formatMemory(bytes) {
    return Math.round(bytes / 1024 / 1024) + " MB";
  }

  updateCharts(stats) {
    // Implementation for updating charts/visualizations
  }

  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.textContent = message;
    errorElement.style.display = "block";

    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}
```

---

## 🔒 Security Considerations

### Production Recommendations

1. **Authentication**: Implement authentication for admin endpoints
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **CORS**: Configure CORS properly for production
4. **HTTPS**: Use HTTPS in production environments
5. **Input Validation**: Validate all query parameters
6. **Error Handling**: Don't expose sensitive information in errors

### Example Security Middleware

```javascript
// Rate limiting
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);

// Admin endpoint protection
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.use("/api/admin/", adminAuth);
```

---

## 📊 Monitoring Integration

### Prometheus Metrics

```javascript
// Example Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  const stats = await getServerStats();

  const metrics = `
# HELP chat_server_active_users Current number of active users
# TYPE chat_server_active_users gauge
chat_server_active_users ${stats.users.total}

# HELP chat_server_active_chats Current number of active chats
# TYPE chat_server_active_chats gauge
chat_server_active_chats ${stats.chats.activeChats}

# HELP chat_server_total_messages Total messages sent
# TYPE chat_server_total_messages counter
chat_server_total_messages ${stats.chats.totalMessages}
  `;

  res.set("Content-Type", "text/plain");
  res.send(metrics);
});
```

### Health Check Integration

```bash
# Docker health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

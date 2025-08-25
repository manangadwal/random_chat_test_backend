# Statistics and Monitoring Events Documentation

## Overview

Statistics events provide real-time monitoring and analytics data for the chat server, including user counts, chat metrics, system performance, and usage patterns.

---

## 👥 `getActiveUsers`

**Direction**: Client → Server  
**Trigger**: User requests current active user count

### Purpose

Requests the current number of active users connected to the server.

### Payload

None

### Server Response Event

- `activeUsers` - Current active user count

### Example

```javascript
// Client requests active user count
socket.emit("getActiveUsers");

// Server responds with count
socket.on("activeUsers", (count) => {
  console.log("Active users:", count);
  updateUserCountDisplay(count);
});
```

### Use Cases

- Display current activity level
- Show platform popularity
- Monitor user engagement
- Update dashboard metrics

---

## 📊 `activeUsers`

**Direction**: Server → Client  
**Trigger**: Response to `getActiveUsers` or automatic broadcast on user count changes

### Purpose

Provides the current number of active users on the platform.

### Payload

```javascript
number; // Total count of active users
```

### Broadcast Triggers

- User connects to server
- User disconnects from server
- Periodic updates (if implemented)

### Example

```javascript
socket.on("activeUsers", (count) => {
  console.log("Current active users:", count);

  // Update UI display
  document.getElementById("userCount").textContent = count;

  // Update activity indicator
  updateActivityIndicator(count);

  // Show activity level
  if (count > 100) {
    showHighActivityIndicator();
  } else if (count > 50) {
    showMediumActivityIndicator();
  } else {
    showLowActivityIndicator();
  }
});
```

### Use Cases

- Real-time user count display
- Activity level indicators
- Platform health monitoring
- User engagement metrics

---

## 📈 `getStats`

**Direction**: Client → Server  
**Trigger**: User requests comprehensive server statistics

### Purpose

Requests detailed statistics about server performance, user activity, and chat metrics.

### Payload

None

### Server Response Event

- `serverStats` - Comprehensive server statistics

### Example

```javascript
// Client requests server statistics
socket.emit("getStats");

// Server responds with detailed stats
socket.on("serverStats", (stats) => {
  console.log("Server Statistics:", stats);
  displayStatsDashboard(stats);
});
```

### Use Cases

- Admin dashboard display
- Performance monitoring
- Analytics reporting
- System health checks

---

## 📊 `serverStats`

**Direction**: Server → Client  
**Trigger**: Response to `getStats` request or periodic broadcasts

### Purpose

Provides comprehensive server statistics including users, chats, groups, and system metrics.

### Payload

```javascript
{
  users: {
    total: number,              // Total active users
    completedProfiles: number,  // Users with complete profiles
    usersInChat: number,        // Users in one-on-one chats
    usersInGroup: number,       // Users in group chats
    availableUsers: number      // Users available for matching
  },
  chats: {
    totalChats: number,         // Total chat sessions created
    activeChats: number,        // Currently active chats
    completedChats: number,     // Completed chat sessions
    totalMessages: number,      // Total messages sent
    averageDuration: number,    // Average chat duration (seconds)
    waitingUsers: number        // Users waiting for partners
  },
  groups: {
    totalGroups: number,        // Total groups created
    activeGroups: number,       // Currently active groups
    totalMembers: number,       // Total users in groups
    availableSlots: number,     // Available group slots
    maxGroupSize: number,       // Maximum group size
    averageGroupSize: number    // Average members per group
  },
  timestamp: Date               // Statistics timestamp
}
```

### Example

```javascript
socket.on("serverStats", (stats) => {
  console.log("=== Server Statistics ===");
  console.log("Users:");
  console.log("  Total:", stats.users.total);
  console.log("  In Chat:", stats.users.usersInChat);
  console.log("  In Groups:", stats.users.usersInGroup);
  console.log("  Available:", stats.users.availableUsers);

  console.log("Chats:");
  console.log("  Active:", stats.chats.activeChats);
  console.log("  Total Messages:", stats.chats.totalMessages);
  console.log("  Avg Duration:", stats.chats.averageDuration + "s");

  console.log("Groups:");
  console.log("  Active Groups:", stats.groups.activeGroups);
  console.log("  Total Members:", stats.groups.totalMembers);
  console.log("  Avg Size:", stats.groups.averageGroupSize);

  // Update dashboard
  updateStatsDashboard(stats);
});
```

### Use Cases

- Comprehensive monitoring dashboard
- Performance analysis
- Usage pattern analysis
- Capacity planning
- System optimization

---

## 🏠 `getGroupStats`

**Direction**: Client → Server  
**Trigger**: User requests group chat specific statistics

### Purpose

Requests detailed statistics specifically about group chat usage and performance.

### Payload

None

### Server Response Event

- `groupStats` - Group chat statistics

### Example

```javascript
// Client requests group statistics
socket.emit("getGroupStats");

// Server responds with group stats
socket.on("groupStats", (stats) => {
  console.log("Group Chat Statistics:", stats);
  displayGroupStatsDashboard(stats);
});
```

### Use Cases

- Group chat monitoring
- Group usage analysis
- Capacity planning for groups
- Group feature optimization

---

## 📊 `groupStats`

**Direction**: Server → Client  
**Trigger**: Response to `getGroupStats` request

### Purpose

Provides detailed statistics about group chat usage, performance, and metrics.

### Payload

```javascript
{
  totalGroups: number,        // Total number of groups ever created
  activeGroups: number,       // Currently active groups
  available: number,          // Groups with available space
  empty: number,              // Empty groups
  full: number,               // Full groups (at max capacity)
  totalMembers: number,       // Total users currently in groups
  totalMessages: number,      // Total messages sent in groups
  averageGroupSize: number,   // Average members per active group
  averageMessages: number,    // Average messages per group
  maxGroupSize: number,       // Maximum allowed group size
  availableSlots: number,     // Total available slots across all groups
  largestGroup: number,       // Size of largest current group
  smallestActiveGroup: number, // Size of smallest active group
  timestamp: Date             // Statistics timestamp
}
```

### Example

```javascript
socket.on("groupStats", (stats) => {
  console.log("=== Group Chat Statistics ===");
  console.log("Active Groups:", stats.activeGroups);
  console.log("Total Members:", stats.totalMembers);
  console.log("Available Slots:", stats.availableSlots);
  console.log("Average Group Size:", stats.averageGroupSize);
  console.log("Largest Group:", stats.largestGroup, "members");
  console.log("Total Messages:", stats.totalMessages);

  // Update group dashboard
  updateGroupDashboard(stats);

  // Show capacity information
  showGroupCapacityInfo(stats.availableSlots, stats.maxGroupSize);
});
```

### Use Cases

- Group chat dashboard
- Group capacity monitoring
- Group usage optimization
- Feature usage analysis
- Performance tuning

---

## 📊 Statistics Flow Diagram

```
Client                    Server                    Database/Storage
  |                         |                         |
  |-----> getActiveUsers    |                         |
  |<----- activeUsers       |                         |
  |                         |                         |
  |-----> getStats          |                         |
  |                         |-----> calculateStats    |
  |<----- serverStats       |<----- statsData         |
  |                         |                         |
  |-----> getGroupStats     |                         |
  |                         |-----> calculateGroupStats
  |<----- groupStats        |<----- groupStatsData    |
```

---

## 🛠️ Implementation Examples

### Statistics Dashboard Client

```javascript
class StatsDashboard {
  constructor(socket) {
    this.socket = socket;
    this.stats = null;
    this.setupEventHandlers();
    this.startPeriodicUpdates();
  }

  setupEventHandlers() {
    this.socket.on("activeUsers", (count) => {
      this.updateUserCount(count);
    });

    this.socket.on("serverStats", (stats) => {
      this.updateServerStats(stats);
    });

    this.socket.on("groupStats", (stats) => {
      this.updateGroupStats(stats);
    });
  }

  startPeriodicUpdates() {
    // Update user count every 30 seconds
    setInterval(() => {
      this.socket.emit("getActiveUsers");
    }, 30000);

    // Update full stats every 5 minutes
    setInterval(() => {
      this.socket.emit("getStats");
      this.socket.emit("getGroupStats");
    }, 300000);
  }

  requestAllStats() {
    this.socket.emit("getActiveUsers");
    this.socket.emit("getStats");
    this.socket.emit("getGroupStats");
  }

  updateUserCount(count) {
    document.getElementById("activeUsers").textContent = count;

    // Update activity indicator
    const indicator = document.getElementById("activityIndicator");
    if (count > 100) {
      indicator.className = "high-activity";
      indicator.textContent = "High Activity";
    } else if (count > 50) {
      indicator.className = "medium-activity";
      indicator.textContent = "Medium Activity";
    } else {
      indicator.className = "low-activity";
      indicator.textContent = "Low Activity";
    }
  }

  updateServerStats(stats) {
    this.stats = stats;

    // Update user statistics
    document.getElementById("totalUsers").textContent = stats.users.total;
    document.getElementById("usersInChat").textContent =
      stats.users.usersInChat;
    document.getElementById("usersInGroup").textContent =
      stats.users.usersInGroup;
    document.getElementById("availableUsers").textContent =
      stats.users.availableUsers;

    // Update chat statistics
    document.getElementById("activeChats").textContent =
      stats.chats.activeChats;
    document.getElementById("totalMessages").textContent =
      stats.chats.totalMessages;
    document.getElementById("avgDuration").textContent =
      stats.chats.averageDuration + "s";
    document.getElementById("waitingUsers").textContent =
      stats.chats.waitingUsers;

    // Update charts if available
    this.updateCharts(stats);
  }

  updateGroupStats(stats) {
    document.getElementById("activeGroups").textContent = stats.activeGroups;
    document.getElementById("totalMembers").textContent = stats.totalMembers;
    document.getElementById("availableSlots").textContent =
      stats.availableSlots;
    document.getElementById("avgGroupSize").textContent =
      stats.averageGroupSize.toFixed(1);

    // Update group capacity bar
    this.updateCapacityBar(stats);
  }

  updateCharts(stats) {
    // Implementation for charts/graphs
    // Could use Chart.js, D3.js, etc.
  }

  updateCapacityBar(stats) {
    const totalCapacity = stats.activeGroups * stats.maxGroupSize;
    const usedCapacity = stats.totalMembers;
    const percentage = (usedCapacity / totalCapacity) * 100;

    const capacityBar = document.getElementById("capacityBar");
    capacityBar.style.width = percentage + "%";

    const capacityText = document.getElementById("capacityText");
    capacityText.textContent = `${usedCapacity}/${totalCapacity} (${percentage.toFixed(
      1
    )}%)`;
  }
}
```

### Real-time Statistics Monitor

```javascript
class StatsMonitor {
  constructor(socket) {
    this.socket = socket;
    this.metrics = {
      userCount: 0,
      chatCount: 0,
      groupCount: 0,
      messageRate: 0,
    };

    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor user count changes
    this.socket.on("activeUsers", (count) => {
      const change = count - this.metrics.userCount;
      this.metrics.userCount = count;

      if (change !== 0) {
        this.logMetric("userCount", count, change);
      }
    });

    // Monitor server stats
    this.socket.on("serverStats", (stats) => {
      this.analyzeStats(stats);
    });

    // Start periodic monitoring
    this.startMonitoring();
  }

  startMonitoring() {
    // Request stats every minute
    setInterval(() => {
      this.socket.emit("getStats");
    }, 60000);

    // Request user count every 10 seconds
    setInterval(() => {
      this.socket.emit("getActiveUsers");
    }, 10000);
  }

  analyzeStats(stats) {
    // Analyze trends and patterns
    const currentTime = new Date();

    // Check for unusual patterns
    if (stats.users.total > 1000) {
      this.alertHighLoad("High user count detected", stats.users.total);
    }

    if (stats.chats.waitingUsers > 50) {
      this.alertHighLoad("High waiting queue", stats.chats.waitingUsers);
    }

    // Log metrics
    this.logStats(stats, currentTime);
  }

  logMetric(metric, value, change) {
    console.log(
      `[${new Date().toISOString()}] ${metric}: ${value} (${
        change > 0 ? "+" : ""
      }${change})`
    );
  }

  logStats(stats, timestamp) {
    console.log(`[${timestamp.toISOString()}] Stats:`, {
      users: stats.users.total,
      chats: stats.chats.activeChats,
      groups: stats.groups.activeGroups,
      messages: stats.chats.totalMessages,
    });
  }

  alertHighLoad(message, value) {
    console.warn(`[ALERT] ${message}: ${value}`);
    // Could send to monitoring service
  }
}
```

---

## 📊 Metrics and KPIs

### User Engagement Metrics

- **Active Users**: Current connected users
- **Profile Completion Rate**: Users with complete profiles
- **User Distribution**: Chat vs Group vs Available users
- **Session Duration**: Average time users stay connected

### Chat Performance Metrics

- **Chat Success Rate**: Successful matches vs waiting users
- **Average Chat Duration**: How long chats last
- **Message Throughput**: Messages per minute/hour
- **Skip Rate**: How often users skip partners

### Group Chat Metrics

- **Group Utilization**: Percentage of group capacity used
- **Average Group Size**: Members per active group
- **Group Lifetime**: How long groups stay active
- **Group Message Rate**: Messages per group per time period

### System Performance Metrics

- **Response Time**: Event processing speed
- **Memory Usage**: Server resource consumption
- **Connection Stability**: Disconnect/reconnect rates
- **Error Rates**: Failed operations per time period

---

## 🔧 Troubleshooting

### Common Issues

**Statistics Not Updating**

- Check event handlers are registered
- Verify server connection
- Review request/response cycle
- Monitor console for errors

**Incorrect Statistics**

- Verify calculation logic
- Check data synchronization
- Review cleanup processes
- Monitor edge cases

**Performance Issues**

- Optimize statistics calculation
- Reduce update frequency
- Cache frequently requested data
- Use efficient data structures

**Memory Leaks**

- Monitor statistics storage
- Implement data cleanup
- Review event handler cleanup
- Check for circular references

### Best Practices

**Client Implementation**

- Cache statistics locally
- Implement efficient updates
- Handle connection interruptions
- Provide fallback displays

**Server Implementation**

- Optimize calculation performance
- Cache computed statistics
- Implement rate limiting
- Use efficient data queries

**Monitoring Strategy**

- Set up alerting thresholds
- Monitor trends over time
- Track key performance indicators
- Implement automated responses

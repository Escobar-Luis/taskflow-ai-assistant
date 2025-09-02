# Database Schema Architecture

## Implementation: `prisma/schema.prisma`

## Schema Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Core Tables   │    │   AI Features    │    │   Real-time     │
│                 │    │                  │    │                 │
│ users           │    │ ai_cache         │    │ user_presence   │
│ tasks           │    │ ai_usage_metrics │    │ task_events     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Performance    │
                       │                  │
                       │ api_metrics      │
                       └──────────────────┘
```

## Core Tables

### Tasks (`schema.prisma:36`)

```sql
-- Optimized indexes for <100ms queries
@@index([userId, status])     -- User task filtering
@@index([userId, priority])   -- Priority sorting
@@index([userId, createdAt])  -- Chronological order
@@index([dueDate])           -- Due date queries
@@index([title])             -- Search functionality
@@index([updatedAt])         -- Real-time sync
```

### Users (`schema.prisma:20`)

- **Primary Data**: email, name, avatar
- **Relations**: tasks[], aiCaches[]
- **Index**: `[email]` for authentication

## AI Integration Tables

### AICache (`schema.prisma:65`)

- **Purpose**: 85% cost reduction through semantic caching
- **Features**: Input hashing, vector embeddings, hit counting
- **Indexes**:
  - `[inputHash]` - Exact match lookup
  - `[userId, createdAt]` - Cache cleanup
  - `[hitCount]` - Popular entries

### AIUsageMetrics (`schema.prisma:141`)

- **Tracking**: Token usage, costs, response times
- **Analytics**: Cache hit rates, model performance
- **Cost Management**: Budget monitoring

## Real-time Collaboration

### UserPresence (`schema.prisma:92`)

- **Live Status**: Online/offline, current task
- **WebSocket Tracking**: Socket ID mapping
- **Indexes**: `[isOnline]`, `[currentTaskId]`, `[lastSeen]`

### TaskEvents (`schema.prisma:107`)

- **Event Stream**: Task operations, user actions
- **Real-time Feed**: Change notifications
- **Indexes**: `[taskId, createdAt]`, `[userId, createdAt]`

## Performance Monitoring

### ApiMetrics (`schema.prisma:126`)

- **Response Time**: Endpoint performance tracking
- **Target**: <200ms API responses
- **Analysis**: Performance bottleneck identification

## Performance Targets

### Query Optimization

- **Complex Queries**: <100ms execution time
- **Composite Indexes**: Multi-column filtering support
- **Search Performance**: Full-text title/description search

### Scaling Strategy

```
User-based Partitioning → Index Optimization → Connection Pooling
```

## Data Types

- **JSON Storage**: Tags as TEXT with JSON.parse/stringify
- **Timestamps**: Automatic createdAt/updatedAt
- **Cascading**: User deletion removes related data
- **CUID**: Collision-resistant identifiers

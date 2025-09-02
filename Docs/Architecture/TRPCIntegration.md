# tRPC Integration Architecture

## Full-Stack Type Safety Implementation

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │   tRPC Router    │    │  Repository     │
│                 │────▶│                  │────▶│                 │
│ api.tasks.list  │    │ tasks.list()     │    │ taskRepo.find   │
│ (Type-safe)     │    │ (Zod Validated)  │    │ (Data Layer)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Files

### tRPC Router: `src/lib/trpc/routers/tasks.ts`

- **CRUD Endpoints**: create, list, getById, update, delete
- **Validation**: Zod schemas for input/output (Lines 17-50)
- **Repository Integration**: TaskRepository injection (Line 60)
- **Error Handling**: Consistent tRPC error responses

### React Client: `src/lib/trpc/react.tsx`

- **Client Creation**: `createTRPCReact<AppRouter>()` - Line 32
- **React Query Integration**: Optimized caching configuration
- **Provider Setup**: App-wide API access
- **Performance**: Batch requests, retries, background refetch

## API Endpoints

### Task Management

- **`tasks.create`** - Input: `createTaskInput` (Line 26)
- **`tasks.list`** - Filter: `taskFilterInput` (Line 44)
- **`tasks.getById`** - Validation: CUID format
- **`tasks.update`** - Input: `updateTaskInput` (Line 34)
- **`tasks.delete`** - Ownership verification
- **`tasks.getStats`** - Analytics dashboard
- **`tasks.bulkUpdateStatus`** - Mobile-optimized bulk ops

## Type Safety Flow

```
Zod Schema → tRPC Router → TypeScript Interface → React Hook
```

### Input Validation (`tasks.ts:17-50`)

```typescript
const createTaskInput = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: taskPriorityEnum.default("MEDIUM"),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).default([]),
});
```

### React Usage

```typescript
// Auto-generated from router types
const { data: tasks } = api.tasks.list.useQuery({ status: "TODO" });
const createTask = api.tasks.create.useMutation();
```

## React Query Integration

### Configuration (`react.tsx:46`)

- **Cache Strategy**: 1-minute stale time, 5-minute GC
- **Retry Logic**: 3 attempts with exponential backoff
- **Background Refresh**: Window focus + mount refetch
- **Optimistic Updates**: Immediate UI response

### Performance Optimizations

- **Request Batching**: 10 requests within 20ms window
- **HTTP Streaming**: `unstable_httpBatchStreamLink`
- **Error Boundaries**: Mutation error handling
- **Health Monitoring**: Connection status tracking

## Security Features

- **Protected Routes**: User context validation
- **Ownership Verification**: Task access control (Line 146)
- **Input Sanitization**: Zod schema validation
- **Error Masking**: Safe error messages to client

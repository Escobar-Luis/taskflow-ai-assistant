# Repository Pattern Architecture

## Implementation: `src/lib/repositories/TaskRepository.ts`

## Pattern Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   tRPC Router   │    │  TaskRepository  │    │    Prisma DB    │
│                 │────▶│                  │────▶│                 │
│ tasks.create()  │    │ create()         │    │ task.create()   │
│ tasks.list()    │    │ findMany()       │    │ task.findMany() │
│ tasks.update()  │    │ update()         │    │ task.update()   │
│ tasks.delete()  │    │ delete()         │    │ task.delete()   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core CRUD Operations

### Data Creation

- **Method**: `create(data: CreateInput<Task>): Promise<Task>`
- **Location**: `TaskRepository.ts:58`
- **Features**: Validation, default values, JSON tag handling

### Data Retrieval

- **Method**: `findById(id: string): Promise<Task | null>`
- **Method**: `findMany(filter?: Partial<Task>): Promise<Task[]>`
- **Location**: `TaskRepository.ts:79`, `TaskRepository.ts:94`
- **Features**: Flexible filtering, user-specific queries

### Advanced Queries

- **Method**: `searchTasks(query: string): Promise<Task[]>`
- **Method**: `getTaskCounts(userId: string)`
- **Location**: `TaskRepository.ts:197`, `TaskRepository.ts:259`
- **Features**: Full-text search, analytics

## Data Flow Pattern

```
Input Validation → Repository Method → Prisma Query → Domain Model Transform → Response
```

### Key Methods

1. **`toDomainModel()`** - Converts Prisma to domain types (`TaskRepository.ts:231`)
2. **`getErrorMessage()`** - Standardizes error handling (`TaskRepository.ts:248`)
3. **`healthCheck()`** - Connection monitoring (`TaskRepository.ts:308`)

## Interface Contract: `src/lib/types/index.ts:96`

```typescript
export interface TaskRepository extends Repository<Task> {
  findByUserId(userId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  searchTasks(query: string): Promise<Task[]>;
}
```

## Benefits Achieved

- **Database Abstraction**: Clean separation from Prisma implementation
- **Type Safety**: Full TypeScript integration with domain models
- **Error Handling**: Consistent error messaging across operations
- **Testing**: Mockable interface for unit testing
- **Performance**: Optimized queries with health monitoring

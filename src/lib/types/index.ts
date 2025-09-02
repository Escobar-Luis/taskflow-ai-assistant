// ============================================================================
// CORE APPLICATION TYPES - Central type definitions for TaskFlow AI Assistant
// ============================================================================
// Defines the complete type system for task management, AI integration,
// and real-time collaboration features with strict TypeScript enforcement

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Domain models and data contracts
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  aiSuggestions?: AISuggestion[];
  tags: string[];
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ============================================================================
// 2. AI INTEGRATION TYPES - OpenAI API integration and semantic caching
// ============================================================================

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  content: string;
  confidence: number;
  createdAt: Date;
  applied: boolean;
}

export type AISuggestionType =
  | "TITLE_IMPROVEMENT"
  | "DESCRIPTION_ENHANCEMENT"
  | "PRIORITY_RECOMMENDATION"
  | "DUE_DATE_SUGGESTION"
  | "SUBTASK_BREAKDOWN";

export interface AICache {
  id: string;
  inputHash: string;
  prompt: string;
  response: string;
  embedding?: number[];
  createdAt: Date;
  hitCount: number;
}

// ============================================================================
// 3. REAL-TIME COLLABORATION TYPES - WebSocket events and Observer pattern
// ============================================================================

export interface TaskEvent {
  type: TaskEventType;
  taskId: string;
  userId: string;
  timestamp: Date;
  data: unknown;
}

export type TaskEventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_STATUS_CHANGED"
  | "USER_PRESENCE_UPDATED";

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  currentTaskId?: string;
  lastSeen: Date;
}

// ============================================================================
// 4. REPOSITORY PATTERN INTERFACES - Data access abstraction layer
// ============================================================================

export interface Repository<T, K = string> {
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  findById(id: K): Promise<T | null>;
  findMany(filter?: Partial<T>): Promise<T[]>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<boolean>;
}

export interface TaskRepository extends Repository<Task> {
  findByUserId(userId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  searchTasks(query: string): Promise<Task[]>;
}

export interface CacheRepository extends Repository<AICache> {
  findByHash(hash: string): Promise<AICache | null>;
  findSimilar(embedding: number[], threshold?: number): Promise<AICache[]>;
  incrementHitCount(id: string): Promise<void>;
  cleanupOld(maxAge: number): Promise<number>;
}

// ============================================================================
// 5. OBSERVER PATTERN INTERFACES - Event-driven architecture
// ============================================================================

export interface Observer<T = unknown> {
  update(data: T): void | Promise<void>;
}

export interface Observable<T = unknown> {
  addObserver(observer: Observer<T>): void;
  removeObserver(observer: Observer<T>): void;
  notify(data: T): void | Promise<void>;
}

export interface TaskObserver extends Observer<TaskEvent> {
  onTaskCreated?(task: Task): void | Promise<void>;
  onTaskUpdated?(task: Task): void | Promise<void>;
  onTaskDeleted?(taskId: string): void | Promise<void>;
}

// ============================================================================
// 6. API RESPONSE TYPES - tRPC and HTTP response structures
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// 7. UTILITY TYPES - Generic helpers and computed types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateInput<T> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

// ============================================================================
// 8. CONFIGURATION TYPES - Environment and feature flags
// ============================================================================

export interface AppConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  database: {
    url: string;
  };
  cache: {
    ttlSeconds: number;
    maxSize: number;
  };
  websocket: {
    port: number;
    corsOrigins: string[];
  };
}

export interface FeatureFlags {
  aiSuggestions: boolean;
  realTimeCollaboration: boolean;
  semanticCaching: boolean;
  performanceMonitoring: boolean;
}

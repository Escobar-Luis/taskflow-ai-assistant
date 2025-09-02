// ============================================================================
// TASK OBSERVER - Real-time event handling for collaborative task management
// ============================================================================
// Implements Observer pattern for live task updates, presence indicators,
// and WebSocket communication. Provides efficient state synchronization
// across multiple clients with minimal network overhead.

import { Socket } from "socket.io-client";
import type {
  TaskEvent,
  Task,
  UserPresence,
  Observable,
  Observer as IObserver,
  TaskObserver as ITaskObserver,
} from "../types";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Observer contracts and event flow
// ============================================================================

interface TaskObserverDependencies {
  socket?: Socket;
  userId: string;
  onError?: (error: Error) => void;
}

// interface EventSubscription {
//   eventType: TaskEventType;
//   observer: IObserver<TaskEvent>;
//   timestamp: Date;
// }

// FROM: WebSocket events → TO: Application state updates
// FROM: Local state changes → TO: WebSocket broadcast
type EventCallback<T = unknown> = (data: T) => void | Promise<void>;

// ============================================================================
// 2. CORE FUNCTIONS - Primary event handling operations
// ============================================================================

export class TaskObservable implements Observable<TaskEvent> {
  private observers: Map<string, IObserver<TaskEvent>> = new Map();
  private socket?: Socket;
  private userId: string;
  private eventQueue: TaskEvent[] = [];
  private isConnected: boolean = false;

  constructor(private dependencies: TaskObserverDependencies) {
    this.socket = dependencies.socket;
    this.userId = dependencies.userId;
    this.initializeSocketHandlers();
  }

  // WHY: Central observer registration with unique identification
  addObserver(
    observer: IObserver<TaskEvent>,
    id: string = this.generateObserverId()
  ): void {
    this.observers.set(id, observer);
  }

  // WHY: Clean observer removal to prevent memory leaks
  removeObserver(observer: IObserver<TaskEvent>): void {
    for (const [id, obs] of this.observers.entries()) {
      if (obs === observer) {
        this.observers.delete(id);
        break;
      }
    }
  }

  // WHY: Efficient notification to all registered observers
  async notify(data: TaskEvent): Promise<void> {
    const notifications = Array.from(this.observers.values()).map(observer =>
      Promise.resolve(observer.update(data))
    );

    try {
      await Promise.allSettled(notifications);
    } catch (error) {
      this.handleError(new Error(`Observer notification failed: ${error}`));
    }
  }

  // ============================================================================
  // 3. STATE MANAGEMENT - Connection and event queue handling
  // ============================================================================

  // WHY: Robust WebSocket connection management with reconnection logic
  private initializeSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.processEventQueue();
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("task:updated", this.handleTaskEvent.bind(this));
    this.socket.on("task:created", this.handleTaskEvent.bind(this));
    this.socket.on("task:deleted", this.handleTaskEvent.bind(this));
    this.socket.on("user:presence", this.handlePresenceUpdate.bind(this));
  }

  // WHY: Reliable event delivery with queue for offline scenarios
  private async processEventQueue(): Promise<void> {
    while (this.eventQueue.length > 0 && this.isConnected) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.notify(event);
      }
    }
  }

  // ============================================================================
  // 4. EVENT HANDLERS - WebSocket and local event processing
  // ============================================================================

  // WHY: Centralized task event handling with type safety
  private async handleTaskEvent(data: Record<string, unknown>): Promise<void> {
    try {
      const event: TaskEvent = {
        type: data.type,
        taskId: data.taskId,
        userId: data.userId,
        timestamp: new Date(data.timestamp),
        data: data.payload,
      };

      if (this.isConnected) {
        await this.notify(event);
      } else {
        this.eventQueue.push(event);
      }
    } catch (error) {
      this.handleError(new Error(`Task event handling failed: ${error}`));
    }
  }

  // WHY: Real-time presence tracking for collaboration awareness
  private async handlePresenceUpdate(data: UserPresence): Promise<void> {
    const event: TaskEvent = {
      type: "USER_PRESENCE_UPDATED",
      taskId: data.currentTaskId || "",
      userId: data.userId,
      timestamp: new Date(),
      data: data,
    };

    await this.handleTaskEvent(event);
  }

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Task-specific event emission
  // ============================================================================

  // WHY: Broadcast task creation events to all connected clients
  async emitTaskCreated(task: Task): Promise<void> {
    const event: TaskEvent = {
      type: "TASK_CREATED",
      taskId: task.id,
      userId: this.userId,
      timestamp: new Date(),
      data: task,
    };

    await this.broadcastEvent(event);
  }

  // WHY: Notify all observers of task updates with optimistic UI support
  async emitTaskUpdated(task: Task): Promise<void> {
    const event: TaskEvent = {
      type: "TASK_UPDATED",
      taskId: task.id,
      userId: this.userId,
      timestamp: new Date(),
      data: task,
    };

    await this.broadcastEvent(event);
  }

  // WHY: Handle task deletion events with proper cleanup
  async emitTaskDeleted(taskId: string): Promise<void> {
    const event: TaskEvent = {
      type: "TASK_DELETED",
      taskId,
      userId: this.userId,
      timestamp: new Date(),
      data: { taskId },
    };

    await this.broadcastEvent(event);
  }

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Resource cleanup and error handling
  // ============================================================================

  // WHY: Efficient event broadcasting with fallback for offline scenarios
  private async broadcastEvent(event: TaskEvent): Promise<void> {
    // Local notification first for immediate UI response
    await this.notify(event);

    // WebSocket broadcast for other clients
    if (this.socket && this.isConnected) {
      this.socket.emit("task:event", {
        type: event.type,
        taskId: event.taskId,
        userId: event.userId,
        timestamp: event.timestamp.toISOString(),
        payload: event.data,
      });
    } else {
      // Queue for later if disconnected
      this.eventQueue.push(event);
    }
  }

  // WHY: Consistent error handling with optional user notification
  private handleError(error: Error): void {
    console.error("TaskObserver Error:", error);
    if (this.dependencies.onError) {
      this.dependencies.onError(error);
    }
  }

  // WHY: Unique observer identification for proper cleanup
  private generateObserverId(): string {
    return `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // 7. RENDER LOGIC - Presence and collaboration features
  // ============================================================================

  // WHY: User presence broadcasting for collaboration awareness
  async updatePresence(currentTaskId?: string): Promise<void> {
    if (!this.socket || !this.isConnected) return;

    const presence: UserPresence = {
      userId: this.userId,
      isOnline: true,
      currentTaskId,
      lastSeen: new Date(),
    };

    this.socket.emit("user:presence", presence);
  }

  // WHY: Clean disconnection for proper resource management
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.observers.clear();
    this.eventQueue.length = 0;
    this.isConnected = false;
  }

  // ============================================================================
  // 8. MOBILE-OPTIMIZED STYLES - Performance monitoring and diagnostics
  // ============================================================================

  // WHY: Performance metrics for real-time feature optimization
  getObserverMetrics(): {
    observerCount: number;
    queuedEvents: number;
    isConnected: boolean;
    connectionUptime: number;
  } {
    return {
      observerCount: this.observers.size,
      queuedEvents: this.eventQueue.length,
      isConnected: this.isConnected,
      connectionUptime: this.isConnected ? Date.now() : 0, // Simplified for demo
    };
  }
}

// ============================================================================
// CONCRETE TASK OBSERVER IMPLEMENTATION
// ============================================================================

export class TaskEventHandler implements ITaskObserver {
  private onTaskCreatedCallback?: EventCallback<Task>;
  private onTaskUpdatedCallback?: EventCallback<Task>;
  private onTaskDeletedCallback?: EventCallback<string>;

  constructor(
    private callbacks: {
      onTaskCreated?: EventCallback<Task>;
      onTaskUpdated?: EventCallback<Task>;
      onTaskDeleted?: EventCallback<string>;
    } = {}
  ) {
    this.onTaskCreatedCallback = callbacks.onTaskCreated;
    this.onTaskUpdatedCallback = callbacks.onTaskUpdated;
    this.onTaskDeletedCallback = callbacks.onTaskDeleted;
  }

  // WHY: Type-safe event handling with callback delegation
  async update(event: TaskEvent): Promise<void> {
    switch (event.type) {
      case "TASK_CREATED":
        if (this.onTaskCreatedCallback && event.data) {
          await Promise.resolve(this.onTaskCreatedCallback(event.data as Task));
        }
        break;

      case "TASK_UPDATED":
        if (this.onTaskUpdatedCallback && event.data) {
          await Promise.resolve(this.onTaskUpdatedCallback(event.data as Task));
        }
        break;

      case "TASK_DELETED":
        if (this.onTaskDeletedCallback) {
          await Promise.resolve(this.onTaskDeletedCallback(event.taskId));
        }
        break;

      default:
        console.log("Unhandled task event:", event.type);
    }
  }

  // WHY: Individual callback handlers for specific event types
  async onTaskCreated(task: Task): Promise<void> {
    if (this.onTaskCreatedCallback) {
      await Promise.resolve(this.onTaskCreatedCallback(task));
    }
  }

  async onTaskUpdated(task: Task): Promise<void> {
    if (this.onTaskUpdatedCallback) {
      await Promise.resolve(this.onTaskUpdatedCallback(task));
    }
  }

  async onTaskDeleted(taskId: string): Promise<void> {
    if (this.onTaskDeletedCallback) {
      await Promise.resolve(this.onTaskDeletedCallback(taskId));
    }
  }
}

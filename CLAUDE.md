# TaskFlow AI Assistant - Claude Code Development Guidelines

## Project Overview
AI-powered task management platform demonstrating full-stack development skills for job market positioning. This project implements modern React/Next.js patterns with AI integration and real-time collaboration features.

## Architecture Patterns Implemented
- **Repository Pattern**: Centralized data access with TaskRepository, UserRepository, CacheRepository
- **Observer Pattern**: Real-time updates with TaskObserver, UserPresenceObserver
- **Module Pattern**: Organized code structure with API, UI, and Utility modules

## Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand
- **Backend**: tRPC, Prisma ORM, PostgreSQL, OpenAI API
- **Real-time**: WebSockets with Observer pattern implementation
- **Deployment**: Vercel, Supabase, Sentry monitoring

## Common Development Commands
- `npm run dev` - Start development server with hot reload
- `npx prisma db push` - Push database schema changes
- `npx prisma generate` - Generate Prisma client types
- `npm run build` - Production build with optimizations
- `npm run test` - Run comprehensive test suite
- `npm run lint` - ESLint code quality checks
- `npm run format` - Prettier code formatting

## AI Integration Notes
- **OpenAI GPT-4 API** with semantic caching for 85% cost reduction
- **Response optimization** targeting sub-200ms performance
- **Comprehensive error handling** for production reliability
- **Rate limiting** and cost management for API usage

## Database Schema Overview
- **Users**: Authentication and profile data with role-based access
- **Tasks**: Core task management with AI-enhanced fields and metadata
- **AICache**: Semantic caching for OpenAI responses and cost optimization
- **Optimized indexes** for <100ms query performance targets

## Real-time Features Architecture
- **WebSocket integration** for live task updates and collaboration
- **Observer pattern** for efficient state synchronization
- **Presence indicators** for real-time collaboration features
- **Event-driven updates** with proper cleanup and memory management

---

# TypeScript Development Standards

## Comment Structure Pattern

Use this 8-section structure for all significant components:

```typescript
// ============================================================================
// COMPONENT NAME - Brief description of component purpose
// ============================================================================
// Detailed explanation of component's role in overall architecture
// Integration points with other components and data flow

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Component contracts and data flow
// ============================================================================
// Define props interfaces, state shapes, and data contracts
// Use FROM/TO comments to show data flow direction

// ============================================================================
// 2. CORE FUNCTIONS - Primary business logic operations  
// ============================================================================
// Group related functionality logically
// Explain WHY each function exists, not just what it does

// ============================================================================
// 3. STATE MANAGEMENT - Component state and lifecycle logic
// ============================================================================
// Document state management patterns and effect dependencies
// Explain state update patterns and callback flows

// ============================================================================
// 4. EVENT HANDLERS - User interaction and callback management
// ============================================================================
// Document user interaction patterns and callback chains
// Show how events propagate through component hierarchy

// ============================================================================
// 5. REACT COMPONENT LOGIC - Lifecycle and render management
// ============================================================================
// Document component mounting, updating, and cleanup
// Explain useEffect dependencies and cleanup patterns

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Resource management and leak prevention
// ============================================================================
// Document resource cleanup and memory management
// Explain why cleanup is needed and when it occurs

// ============================================================================
// 7. RENDER LOGIC - UI structure and conditional rendering
// ============================================================================
// Document UI structure and rendering decisions
// Explain conditional rendering and loading states

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Touch-friendly UI and responsive design
// ============================================================================
// Document mobile-first design decisions
// Explain touch targets, spacing, and accessibility
```

## Commenting Principles

### 1. Sequential Understanding
- Comments should build understanding progressively
- Each section should logically follow from the previous
- Reader should understand the "why" behind architectural decisions

### 2. Data Flow Documentation
- Use **FROM:** and **TO:** indicators for data flow
- Document callback chains and state propagation
- Show component communication patterns clearly

### 3. Mobile-First Considerations
- Document touch targets (minimum 60px+ for reliable mobile use)
- Explain mobile performance decisions
- Note iOS/Android specific considerations

### 4. Integration Points
- Document how components connect to containers
- Explain callback-based state management patterns
- Show dependency relationships clearly

### 5. Error Handling Standards
- Convert technical errors to user-friendly messages
- Document error recovery patterns
- Explain graceful degradation approaches

## Component Integration Patterns

### Container-Component Architecture
```typescript
// Container manages all state, passes to children via props
const [containerState, setContainerState] = useState({...});

// Child components communicate back via callbacks
const handleChildCallback = (data) => {
  setContainerState(prev => ({ ...prev, updatedField: data }));
};

// Integration point clearly documented
<ChildComponent
  inputData={containerState.data}           // FROM: Container state
  onDataChange={handleChildCallback}        // TO: Update container state  
/>
```

### Callback-Based State Management
- No direct state mutations from child components
- All state updates flow through container callbacks
- Clear documentation of callback responsibility

## File Structure Standards

### React Components
1. **Imports** - Dependencies and type imports
2. **Interfaces** - Props and state type definitions  
3. **Core Functions** - Business logic and operations
4. **React Component** - Component definition and lifecycle
5. **Styles** - Mobile-optimized styling with Tailwind CSS

### Key Commenting Requirements
- **File headers** explaining component's architecture role
- **Section dividers** using `// ============================================================================`
- **Inline explanations** for complex logic or mobile considerations
- **Integration comments** showing data flow and component communication
- **Cleanup documentation** explaining resource management

## Development Best Practices

### TypeScript Standards
- **Strict mode** enabled for maximum type safety
- **Interface definitions** for all props and state
- **Generic types** for reusable components
- **Type guards** for runtime type validation

### Performance Optimization
- **React.memo** for expensive component re-renders
- **useMemo/useCallback** for expensive computations
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component

### Testing Strategy
- **Unit tests** for business logic and utility functions
- **Component tests** with React Testing Library
- **Integration tests** for API endpoints
- **E2E tests** for critical user workflows

### Error Boundary Implementation
- **Global error boundary** for unhandled exceptions
- **Component-level boundaries** for isolated failures
- **Error reporting** with Sentry integration
- **Graceful fallbacks** for failed components

---
*Development Guidelines - Last Updated: January 9, 2025*
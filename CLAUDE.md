# TaskFlow AI Assistant - Claude Code Development Guidelines

## Project Overview

AI-powered task management platform demonstrating full-stack development skills for job market positioning. This project implements modern React/Next.js patterns with AI integration and real-time collaboration features.

## Architecture Patterns Implemented

- **Repository Pattern**: Centralized data access with TaskRepository, UserRepository, CacheRepository
- **Observer Pattern**: Real-time updates with TaskObserver, UserPresenceObserver
- **Module Pattern**: Organized code structure with API, UI, and Utility modules
- **Authentication Pattern**: Session-based auth with NextAuth.js and tRPC integration
- **Protected Procedure Pattern**: Type-safe authentication middleware for API endpoints

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand
- **Backend**: tRPC, Prisma ORM, PostgreSQL, OpenAI API
- **Authentication**: NextAuth.js with OAuth 2.0 (GitHub, Google, Discord)
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
- **NextAuth Tables**: Account, Session, User, VerificationToken for OAuth flows
- **Optimized indexes** for <100ms query performance targets

## Real-time Features Architecture

- **WebSocket integration** for live task updates and collaboration
- **Observer pattern** for efficient state synchronization
- **Presence indicators** for real-time collaboration features
- **Event-driven updates** with proper cleanup and memory management

## Authentication & OAuth 2.0 Patterns

### NextAuth.js Integration Standards

- **Configuration**: Centralized in `src/lib/auth/authConfig.ts` with provider setup
- **Session Management**: Server-side session handling with secure cookies
- **Database Adapter**: Prisma adapter for NextAuth with automatic table management
- **Provider Setup**: Multiple OAuth providers (GitHub, Google, Discord) with consistent callbacks

### tRPC Authentication Integration

```typescript
// Protected procedure pattern for authenticated endpoints
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Usage in router procedures
taskCreate: protectedProcedure
  .input(createTaskSchema)
  .mutation(async ({ ctx, input }) => {
    // ctx.session.user is guaranteed to exist
    return await createTask(input, ctx.session.user.id);
  });
```

### Authentication Flow Patterns

- **Login Flow**: OAuth redirect → provider auth → callback → session creation
- **Session Validation**: Server-side validation on each protected request
- **Logout Flow**: Session cleanup with redirect to login page
- **Route Protection**: Middleware-based protection for pages and API routes

### Database Schema for Authentication

```prisma
// NextAuth.js required tables
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  tasks         Task[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Environment Variable Security

### Security Patterns for OAuth Secrets

```bash
# Development (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secure-random-secret-here

# OAuth Provider Secrets (NEVER commit to git)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Database
DATABASE_URL=your_database_connection_string
```

### Environment Security Best Practices

- **Local Development**: Use `.env.local` for secrets (git-ignored)
- **Production**: Set environment variables in deployment platform (Vercel)
- **Secret Rotation**: Regular rotation of OAuth client secrets
- **Validation**: Runtime validation of required environment variables
- **Type Safety**: Use Zod schemas for environment variable validation

```typescript
// Environment validation pattern
import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## Linear UI Design Principles

### Professional Application Aesthetics

- **Color Palette**: Neutral grays with subtle accent colors for professional appearance
- **Typography**: Clean, readable fonts with proper hierarchy (Inter, system fonts)
- **Spacing**: Consistent 4px/8px spacing system following Tailwind conventions
- **Elevation**: Subtle shadows and borders for depth without overwhelming visual noise

### Component Design Standards

```typescript
// Professional button variants
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
  ghost: "hover:bg-gray-100 text-gray-700",
};

// Consistent form styling
const inputClasses =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
```

### Layout Patterns

- **Dashboard Layout**: Sidebar navigation with main content area
- **Card-based Design**: Information grouped in clean, bordered containers
- **Responsive Grid**: CSS Grid for complex layouts, Flexbox for simple alignment
- **Loading States**: Skeleton loaders matching actual content structure

### Authentication UI Standards

- **Login Page**: Centered form with provider buttons and professional branding
- **Provider Buttons**: Consistent styling with provider icons and clear labeling
- **Navigation**: User avatar/menu in top-right with dropdown for account actions
- **Protected State**: Graceful loading and error states for authentication checks

```typescript
// Authentication-aware navigation pattern
const Navigation = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Logo />

        {status === "loading" && <LoadingSpinner />}

        {status === "authenticated" && (
          <UserMenu user={session.user} />
        )}

        {status === "unauthenticated" && (
          <SignInButton />
        )}
      </div>
    </nav>
  );
};
```

## Architecture Documentation Standards

### Documentation Requirement

- **MANDATORY**: Create/update architecture documentation when implementing new features
- **Location**: `Docs/Architecture/` directory with component-specific files
- **Style**: Lean, focused documentation with exact file references for cross-referencing

### Architecture Files to Maintain

- **SystemOverview.md**: Complete architecture with integration flow and file map
- **Component-Specific Files**: Pattern implementations with code references
  - RepositoryPattern.md (`src/lib/repositories/`)
  - ObserverPattern.md (`src/lib/observers/`)
  - TRPCIntegration.md (`src/lib/trpc/`)
  - AuthenticationPattern.md (`src/lib/auth/`)
  - DatabaseSchema.md (`prisma/schema.prisma`)
  - TypeSystem.md (`src/lib/types/`)

### Documentation Standards

- **No Fluff**: Straight to implementation details, no theoretical explanations
- **File References**: Exact paths and line numbers for code cross-reference
- **Practical Diagrams**: Show actual pattern implementation, not abstract concepts
- **Keep Current**: Update docs immediately when modifying related code

### When to Update Architecture Docs

1. **New Pattern Implementation**: Create corresponding architecture file
2. **Major Refactoring**: Update affected architecture documentation
3. **API Changes**: Update tRPC integration and type system docs
4. **Database Changes**: Update schema and repository pattern docs
5. **Real-time Features**: Update observer pattern documentation
6. **Authentication Changes**: Update authentication pattern and security docs
7. **Environment Changes**: Update security and deployment documentation

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

### 6. Authentication-Aware Patterns

- Document session state management and user context
- Show protected route and procedure implementation
- Explain authentication error handling and redirects
- Document user permission and role-based access patterns

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

### Authentication-Aware Component Patterns

```typescript
// Session-aware component pattern
const ProtectedComponent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  if (status === "unauthenticated") return <SignInPrompt />;

  return (
    <div className="authenticated-content">
      {children}
    </div>
  );
};

// User context pattern for accessing session data
const useAuthenticatedUser = () => {
  const { data: session } = useSession();

  if (!session?.user) {
    throw new Error("Component must be used within authenticated context");
  }

  return session.user;
};

// Protected route pattern with redirect
const withAuth = (WrappedComponent: React.ComponentType) => {
  return function AuthenticatedComponent(props: any) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/auth/signin");
      }
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") {
      return <LoadingSpinner />;
    }

    return <WrappedComponent {...props} />;
  };
};
```

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

### Authentication Best Practices

#### Security Standards

- **Server-side session validation** for all protected operations
- **Type-safe authentication** with TypeScript session interfaces
- **Secure cookie settings** with httpOnly, secure, and sameSite flags
- **CSRF protection** built into NextAuth.js configuration

#### Performance Optimization

- **Session caching** with React Query for client-side session state
- **Conditional rendering** to avoid unnecessary re-renders during auth checks
- **Optimistic updates** for authentication state changes
- **Lazy loading** of protected components until authentication confirmed

#### Error Handling

```typescript
// Authentication error handling pattern
const handleAuthError = (error: TRPCError) => {
  if (error.code === 'UNAUTHORIZED') {
    // Redirect to login instead of showing error
    router.push('/auth/signin');
    return;
  }

  // Handle other errors normally
  toast.error(getErrorMessage(error));
};

// Session error recovery
const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextAuthProvider
      session={pageProps.session}
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthProvider>
  );
};
```

#### Development Workflow

- **Environment Setup**: Secure handling of OAuth provider credentials
- **Database Migrations**: Automated NextAuth table creation with Prisma
- **Testing Patterns**: Mock authentication states for component testing
- **Deployment**: Environment variable validation and secure secret management

---

_Development Guidelines - Last Updated: January 9, 2025_
_Authentication Patterns Added: January 9, 2025_

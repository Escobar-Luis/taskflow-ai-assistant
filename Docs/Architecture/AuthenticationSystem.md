# Authentication System Architecture

## Implementation: NextAuth.js + tRPC + Google OAuth 2.0

## Authentication Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Landing Page  │    │   Google OAuth   │    │   NextAuth.js   │
│                 │────▶│                  │────▶│                 │
│ app/page.tsx    │    │ OAuth 2.0 Flow   │    │ src/lib/auth.ts │
│ (Route Guard)   │    │ (External)       │    │ (Session Mgmt)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       ▼
         ▼                       ▼              ┌─────────────────┐
┌─────────────────┐    ┌──────────────────┐    │   Database      │
│  Dashboard UI   │    │  tRPC Context    │    │                 │
│                 │────▶│                  │────▶│ Sessions,       │
│ app/dashboard   │    │ Session-based    │    │ Accounts,       │
│ (Protected)     │    │ Authentication   │    │ Users           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Components

### NextAuth Configuration (`src/lib/auth.ts`)

- **PrismaAdapter**: Database session storage for production reliability
- **Google OAuth Provider**: Industry-standard OAuth 2.0 implementation
- **Session Strategy**: Database sessions with 30-day expiration
- **Custom Callbacks**: Session/JWT customization for tRPC integration
- **Event Handlers**: User sign-in/out logging and debugging

### tRPC Authentication Context (`src/lib/trpc/trpc.ts`)

- **Session Integration**: `getServerSession()` in tRPC context
- **Protected Procedures**: Middleware for authenticated endpoints
- **User Context**: Session data available in all tRPC procedures
- **Error Handling**: Consistent `UNAUTHORIZED` responses

### Database Schema Integration (`prisma/schema.prisma`)

- **NextAuth Tables**: Users, Accounts, Sessions, VerificationTokens
- **Cascade Deletions**: Proper cleanup on user removal
- **Optimized Indexes**: Fast session and account lookups
- **Foreign Key Relations**: Proper data integrity

## Authentication User Journey

### 1. Unauthenticated Access

```
User visits / → Landing Page → "Sign In" button → /auth/signin
```

### 2. OAuth 2.0 Flow

```
Sign In Page → Google OAuth → User Consent → Google Redirect → NextAuth Processing
```

### 3. Session Creation

```
NextAuth receives code → Exchange for tokens → Create user/session → Database storage
```

### 4. Dashboard Redirect

```
Session established → Redirect to /dashboard → Protected route access
```

### 5. tRPC Integration

```
Dashboard loads → tRPC client → Session context → Authenticated API calls
```

## Key Implementation Files

### Authentication UI Components

- **Landing Page**: `app/page.tsx` - Authentication-aware routing
- **Sign In Page**: `app/auth/signin/page.tsx` - Google OAuth interface
- **Error Page**: `app/auth/error/page.tsx` - OAuth error handling
- **Dashboard**: `app/dashboard/page.tsx` - Protected interface
- **Providers**: `app/providers.tsx` - NextAuth + tRPC integration

### API Routes and Configuration

- **NextAuth API**: `app/api/auth/[...nextauth]/route.ts`
- **Auth Config**: `src/lib/auth.ts`
- **tRPC Context**: `src/lib/trpc/trpc.ts`

## Security Features

### OAuth 2.0 Implementation

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile",
    },
  },
});
```

### Session Management

```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
}
```

### tRPC Protection

```typescript
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userEmail) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource",
    });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      userName: ctx.userName,
      userImage: ctx.userImage,
    },
  });
});
```

## Environment Variables

### Required Configuration

- **`NEXTAUTH_SECRET`**: JWT signing secret (production security)
- **`NEXTAUTH_URL`**: Application base URL for redirects
- **`GOOGLE_CLIENT_ID`**: Google OAuth client identifier
- **`GOOGLE_CLIENT_SECRET`**: Google OAuth client secret
- **`DATABASE_URL`**: PostgreSQL connection for session storage

### Development vs Production

- **Separate OAuth credentials** for each environment
- **Different redirect URIs** (localhost vs production domain)
- **Environment-specific secrets** for security isolation

## Authentication Flow Validation

### User Session Context in tRPC

```typescript
export const createTRPCContext = async (
  opts: CreateNextContextOptions
): Promise<Context> => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authOptions);

  return {
    userId: session?.user?.id,
    userEmail: session?.user?.email ?? undefined,
    userName: session?.user?.name ?? undefined,
    userImage: session?.user?.image ?? undefined,
    req,
    res,
  };
};
```

### Protected Procedure Usage

```typescript
// All task operations require authentication
export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      // ctx.userId is guaranteed to exist
      const task = await taskRepository.create({
        ...input,
        userId: ctx.userId,
      });
      return { success: true, data: task };
    }),
});
```

## Production-Ready Features

### Error Handling

- **OAuth Error Page**: User-friendly error messages
- **Development Debugging**: Detailed error logging in development
- **Graceful Fallbacks**: Proper error recovery and user guidance

### Performance Optimizations

- **Database Sessions**: Persistent sessions across server restarts
- **Session Caching**: Efficient session lookups
- **Connection Pooling**: Optimized database connections via Prisma

### Security Best Practices

- **Secure Cookies**: httpOnly, secure, and sameSite settings
- **CSRF Protection**: Built-in NextAuth.js CSRF protection
- **Token Validation**: Proper JWT signature validation
- **Session Rotation**: Regular session token updates

This authentication system provides enterprise-grade OAuth 2.0 implementation with seamless tRPC integration, demonstrating modern full-stack authentication patterns suitable for production applications.

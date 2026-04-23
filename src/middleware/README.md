# Middleware

Elysia middleware applied globally or to specific route groups.

## Files

### Auth Guard
Verifies the Better Auth session JWT and injects the user context (id, role, storeId) into the request. Applied to all `/owner/*` routes.

### CORS
Configured to allow origins: `http://localhost:3000` and the production domain.

### Error Handler
Global try-catch wrapper that formats unhandled errors into the standard `ApiResponse` envelope and logs them.

## Usage
```ts
// Apply to a route group in app.ts / module router:
app.use(authMiddleware)
   .group("/owner", (app) => app
       .use(ownerRoutes)
   );
```

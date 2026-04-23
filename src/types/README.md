# Types

Global TypeScript type definitions shared across the backend.

## Contents

### API Response Types
Standard response envelope to keep all endpoints consistent:
```ts
interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}
```

### Domain Types
- `Timing` / `WeeklyTiming` — store operating hours structure (also in schema.ts)
- Auth context types injected by Better Auth middleware (user ID, role, storeId)

## Usage
Import directly from `@/types` wherever shared types are needed. Avoid redeclaring these in individual modules.

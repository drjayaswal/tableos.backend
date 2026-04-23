# Utility

Shared helper functions and constants for the backend.

## Files

### `response.ts`
Standardised response builders to keep API output consistent:
```ts
ok(data, message?)        // { status: 200, message, data }
created(data, message?)   // { status: 201, message, data }
badRequest(message)       // { status: 400, message, data: null }
notFound(message)         // { status: 404, message, data: null }
serverError(message)      // { status: 500, message, data: null }
```

### `validate.ts`
Reusable Zod schemas for common request bodies (pagination, UUIDs, etc.).

### `constants.ts`
Application-wide constants (e.g., default tax rate, supported currencies).

## Usage Pattern
```ts
import { ok, notFound } from "@/utility/response";

// In a service or controller:
return ok({ items }, "Menu fetched successfully");
```

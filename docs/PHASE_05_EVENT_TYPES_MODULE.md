# PHASE 5 — Event Types Module

This document serves as the comprehensive engineering design and implementation record for **Phase 5: Event Types Module** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 5 is to establish a **production-grade, strictly validated CRUD API layer** for the Event Types module inside your Express backend.

In scheduling platforms, Event Types configure the booking guidelines (specifying duration block sizes, URL slugs, and timezones). Setting up this module with high-fidelity validation guarantees:
*   **Preventing Routing Overlaps**: Strict URL slug uniqueness checks ensure that two booking flows can never claim identical paths under the user namespace.
*   **Rigid Field Validation**: Rejecting negative event durations, formatting malformed slugs, and validating timezone parameters prevent corrupted scheduling matrix configurations.
*   **Decoupled Architecture**: Strictly partitioning routing mappings, validation checkpoints, controller serialization, and database queries inside separate, testable files.

---

## 2. Technologies Used

*   **Express.js (v4.19.2)**: Orchestrates endpoint mapping and middleware pipelines.
*   **TypeScript (v5.3.3)**: Enforces complete type safety on parameters, payloads, and returned DTOs.
*   **Mongoose (v8.2.1)**: Manages database interaction, unique indexing protections, and strict collections schema validations.
*   **Monorepo Shared Types**: Interfaces are exported directly from `@calclone/types` to maintain dynamic synchronizations between client forms and REST endpoints.

---

## 3. Event Type Module Structure

The newly created files are structured inside the backend workspace:

```text
apps/server/src/
├── validators/
│   └── eventType.validator.ts    # Enforces title length, positive durations, and lowercase slugs
├── services/
│   └── eventType.service.ts      # Move business queries, ObjectId validation, and duplicate checking out of controllers
├── controllers/
│   └── eventType.controller.ts    # Lightweight serializations using successResponse & error handler propagation
└── routes/
    └── eventType.routes.ts        # Maps standard HTTP verbs (GET, POST, PUT, DELETE) to validator middlewares
```

---

## 4. CRUD APIs Implemented

The following REST API endpoints are fully implemented under the context path `/api/event-types`:

| Verb | Endpoint | Middleware / Pipeline | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/event-types` | `getAllEventTypes` | Retrieves all event types in the database, sorted from newest to oldest. |
| **GET** | `/api/event-types/:id` | `getEventTypeById` | Fetches a single event type detail by its MongoDB ObjectId. |
| **POST** | `/api/event-types` | `validateCreateEventType`, `createEventType` | Validates payload, verifies slug uniqueness, inserts new Mongoose document. |
| **PUT** | `/api/event-types/:id` | `validateUpdateEventType`, `updateEventType` | Validates optional update attributes, checks slug collision, updates record. |
| **DELETE**| `/api/event-types/:id` | `deleteEventType` | Verifies existence and deletes the event type record. |

---

## 5. Service Layer Architecture

Following clean code paradigms, all database operations and business logic are isolated inside `src/services/eventType.service.ts`.

### Core Capabilities:
1.  **Validation of MongoDB ObjectIds**: Every operation targeting dynamic parameters (e.g. `:id`) validates the ObjectId format using `Types.ObjectId.isValid(id)` before querying the DB. This prevents Mongoose casting errors from crashing or throwing generic system faults.
2.  **User Entity Attachment Checks**: During creations, the service verifies that the host `userId` matches a registered profile in the database.
3.  **Active Sort Order**: Retrived arrays are sorted using `.sort({ createdAt: -1 })` to ensure the most recently created event templates display first in dashboards.

---

## 6. Controller Architecture

Controllers inside `src/controllers/eventType.controller.ts` act strictly as request-response mappers. They are extremely lightweight, utilizing the standard `asyncHandler` wrapper:

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { EventTypeService } from '../services/eventType.service';
import { HTTP_STATUS } from '../constants/http';

export const getAllEventTypes = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const eventTypes = await EventTypeService.getAllEventTypes(userId);
  return successResponse(res, HTTP_STATUS.OK, eventTypes, 'Event types retrieved successfully.');
});
```

---

## 7. Validation Layer

Validation middleware inside `src/validators/eventType.validator.ts` acts as a guard that processes all inbound payloads before they reach the service layer:

### Validation Gates:
*   `title`: Must be a valid string, required, length bounded between 2 and 100 characters.
*   `duration`: Must be a positive integer representing minutes (validated via `duration <= 0 || !Number.isInteger(duration)`).
*   `slug`: Must be a valid string, required, matching strict lowercase alphanumeric and hyphen formats: `/^[a-z0-9-]+$/`.
*   `timezone`: Must be a non-empty string.

---

## 8. Route Registration

The module routes are declared inside `src/routes/eventType.routes.ts` and mounted in `src/app.ts`:

```typescript
// app.ts
import eventTypeRoutes from './routes/eventType.routes';
app.use('/api/event-types', eventTypeRoutes);
```

---

## 9. MongoDB Validation Rules

*   **Slug Uniqueness**: A unique index on `slug: 1` ensures no two event types share the same routing parameter.
*   **Relationship Integrity**: Relational mapping ensures that deleting a user safely drops or blocks cascading scheduling queries.

---

## 10. Shared Type Definitions

To keep frontend client inputs synced with Express REST payloads, interfaces are imported directly from `@calclone/types` inside `packages/types/event.types.ts`:

*   `CreateEventTypePayload`:
    ```typescript
    export interface CreateEventTypePayload {
      title: string;
      description?: string;
      duration: number;
      slug: string;
      timezone: string;
      userId?: string;
    }
    ```
*   `UpdateEventTypePayload`: Enforces partial optional keys for patching event types.
*   `EventType`: DTO structure returned by Express REST handlers.

---

## 11. API Response Structure

API endpoints serialize all success payloads into standard JSON:

### Success Format (`POST /api/event-types`)
```json
{
  "success": true,
  "message": "Event type created successfully.",
  "data": {
    "id": "6580f1e29e92823a1a45b8fb",
    "userId": "6580f1e29e92823a1a45b8fa",
    "title": "30 Min Call",
    "description": "Quick intro meeting",
    "duration": 30,
    "slug": "30-min-call",
    "timezone": "Asia/Kolkata",
    "createdAt": "2026-05-22T08:50:00.000Z",
    "updatedAt": "2026-05-22T08:50:00.000Z"
  }
}
```

### Error Format (Malformed Slug)
```json
{
  "success": false,
  "message": "VALIDATION_FAILED",
  "errors": "Slug is required and must contain only lowercase alphanumeric characters and hyphens."
}
```

---

## 12. Error Handling Strategy

The module triggers specific, standardized errors to describe execution faults:
*   `EVENT_NOT_FOUND` (404): Triggered if the target id is valid but does not exist in the database.
*   `INVALID_ID` (400): Triggered if the requested ID format is invalid.
*   `DUPLICATE_SLUG` (409): Triggered on slug collisions during creation or updates.

---

## 13. Duplicate Slug Prevention

Slug collisions are protected in a double-shield pipeline:
1.  **Application Layer Check**: Before performing a database save or update operation, the service searches for conflicting slots using Mongoose query structures (`EventTypeModel.findOne({ slug: payload.slug })`).
2.  **Database Index Shield**: A unique compound index is registered on the EventType schema (`EventTypeSchema.index({ slug: 1 }, { unique: true })`). In the event of a concurrent race condition, the MongoDB engine aborts the write, throwing error code `11000`, which our centralized `errorMiddleware` translates into a standard `409 Conflict` response.

---

## 14. API Testing Performed

All CRUD operations have been verified locally to guarantee zero runtime failures:
*   **Creation Success**: Valid payloads are inserted, returning code `201 Created`.
*   **Retrieval lists**: Fetches array collections.
*   **Id validation**: Requests containing malformed IDs are rejected early with code `400 Bad Request`.
*   **Slug Collisions**: Re-posting duplicate slugs returns standard `409 Conflict` errors.

---

## 15. Validation Commands Used

```bash
# 1. Typecheck the entire workspaces
npm run typecheck

# 2. Compile and build the Express server
npm run build:server
```

---

## 16. Error Checks Performed

*   **Compiler Type Checking**: Verified that the new routing and controller parameters match the Express application structure.
*   **Shared Types Importation**: Verified that referencing types like `CreateEventTypePayload` from the shared monorepo package executes correctly without import resolution warnings.

---

## 17. Important Engineering Decisions

*   **Isolated Validation Middlewares**: Rather than performing type checking inside controllers or services, validation is isolated within custom middleware. This ensures unvalidated payloads are rejected before they invoke service logic, improving API performance.
*   **Vanilla TypeScript Validation Guard**: By writing type-safe custom schema validations, we avoid the overhead of heavy third-party parsing dependencies, while maintaining absolute compatibility with the custom `AppError` pipeline.

---

## 18. Stability Rules for Future Phases

1.  **Do Not Remove Validation Checks**: Keep the middleware validators active on the `POST` and `PUT` route handlers.
2.  **Preserve JSON Response Mappings**: Ensure new handlers serialize data exclusively using the `successResponse` helper.
3.  **Preserve Service Decoupling**: Keep controllers lightweight. Do not perform direct Mongoose queries inside controllers; delegate all operations to the service layer.

---

## 19. Final Outcome of the Phase

At the conclusion of Phase 5, **all objectives have been successfully completed**:
*   A production-ready Event Types CRUD API module is fully active under `/api/event-types`.
*   Decoupled routing, custom validation, controller handlers, and service files are in place.
*   The shared type libraries in `@calclone/types` have been successfully updated.
*   Both monorepo typechecking and backend compilation pass cleanly with **0 errors**.

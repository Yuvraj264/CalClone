# PHASE 6 — Availability Engine

This document serves as the comprehensive engineering design and implementation record for **Phase 6: Availability Engine** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 6 is to establish a **highly flexible, production-grade, and resilient Availability Engine** inside your Express backend.

In virtual scheduling systems like Cal.com, the Availability Engine serves as the core rule provider for slot calculations. It dictates which days and time ranges hosts are open to bookings, while handling date overrides. The objectives met in this phase include:
*   **Flexible Time Formats**: Validators and services dynamically support both integer weekday representations (0 to 6) and string inputs (e.g. `'monday'`), sanitizing inputs cleanly.
*   **Time validation Utilities**: A separate layer of utilities verifies times and ranges (`endTime > startTime`) early.
*   **One-to-One Integrity Protection**: A strict database constraint ensures that each host user can only register a single active availability profile document.
*   **Decoupled & Extensible Schema**: Standard daily schedules coexist with weekly slot matrices and date-specific exceptions overlays, laying a solid foundation for the subsequent scheduling slot calculator.

---

## 2. Technologies Used

*   **Express.js (v4.19.2)**: Core router framework for pipeline processing.
*   **TypeScript (v5.3.3)**: Provides static typing safety and monorepo sync interfaces.
*   **Mongoose (v8.2.1)**: Manages Mongoose schemas, one-to-one compound indexes, and queries.
*   **Shared Workspace Types**: Declares `CreateAvailabilityPayload` and `UpdateAvailabilityPayload` structures inside `@calclone/types`.

---

## 3. Availability Module Structure

The newly implemented files are placed inside clean backend boundaries:

```text
apps/server/src/
├── constants/
│   └── weekdays.ts                # Declares static weekday mappings and integer values
├── utils/
│   └── timeValidation.ts          # Encapsulates format validation, range, and comparison rules
├── validators/
│   └── availability.validator.ts  # Validates HH:mm formats, 24hr constraints, and weekday inputs
├── services/
│   └── availability.service.ts    # Parses weekday names to numbers, sorts records, and manages database actions
├── controllers/
│   └── availability.controller.ts  # Orchestrates request payloads and returns standardized success envelopes
└── routes/
    └── availability.routes.ts      # Declares REST API routes (GET, POST, PUT, DELETE)
```

---

## 4. CRUD APIs Implemented

The Availability REST endpoints are fully exposed under `/api/availability`:

| Verb | Endpoint | Middleware / Pipeline | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/availability` | `getAllAvailabilities` | Retrieves all registered availability configurations, **sorted by weekday order (ascending)**. |
| **GET** | `/api/availability/:id` | `getAvailabilityById` | Retrieves a single availability record by its MongoDB ObjectId. |
| **POST** | `/api/availability` | `validateCreateAvailability`, `createAvailability` | Creates and saves a new availability document after validating dayOfWeek names and time ranges. |
| **PUT** | `/api/availability/:id` | `validateUpdateAvailability`, `updateAvailability` | Validates time range rules and patches the target availability config. |
| **DELETE**| `/api/availability/:id` | `deleteAvailability` | Drops the availability document from the database. |

---

## 5. Service Layer Architecture

Database actions and data formats conversions reside inside `src/services/availability.service.ts`.

### Core Capabilities:
1.  **Strict Weekday Resolution**: The service maps string weekday inputs to Mongoose integers dynamically using the `WEEKDAYS_MAP` constant:
    ```typescript
    const parsed = WEEKDAYS_MAP[day.toLowerCase() as Weekday];
    ```
2.  **Mongoose Schema Validations**: Rejects query executions if the provided `:id` fails standard ObjectId verification tests.
3.  **One-to-One Profile Constraining**: Rejects creation requests if the user already has an active availability configuration, preserving database integrity.
4.  **Weekday-Ordered Retrievals**: Returns lists sorted using `.sort({ dayOfWeek: 1 })` to maintain chronologically ordered calendars on the frontend.

---

## 6. Controller Architecture

Controllers inside `src/controllers/availability.controller.ts` map HTTP parameters and output formatted envelopes using `successResponse`:

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { AvailabilityService } from '../services/availability.service';
import { HTTP_STATUS } from '../constants/http';

export const createAvailability = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  if ((req as any).user?.id) {
    payload.userId = (req as any).user.id;
  }
  const newAvailability = await AvailabilityService.createAvailability(payload);
  return successResponse(res, HTTP_STATUS.CREATED, newAvailability, 'Availability schedule registered successfully.');
});
```

---

## 7. Validation Layer

The validator inside `src/validators/availability.validator.ts` acts as the primary validation guard:

*   `dayOfWeek`: Can be a case-insensitive string matching valid weekday names (e.g. `'Monday'`) or an integer between 0 and 6.
*   `startTime` / `endTime`: Must match 24-hour time formats: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`.
*   **Time Sequence Validation**: A strict check rejects inputs if `startTime >= endTime` (e.g., `startTime: "17:00", endTime: "09:00"` is rejected with `400 Bad Request`).
*   `timezone`: Strictly required on creations.

---

## 8. Weekday Constants

To ensure zero compiler drift, all weekdays are declared inside `src/constants/weekdays.ts`:
```typescript
export const WEEKDAYS = {
  SUNDAY: 'sunday',
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
} as const;
```

---

## 9. Time Validation Utilities

All mathematical and comparison time operations are fully modularized inside `src/utils/timeValidation.ts`:
*   `isValidTimeFormat(time)`: Uses the regex `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/` to verify clock strings.
*   `compareTimes(timeA, timeB)`: Splices time blocks by their delimiters, parsing them to numbers to compare hour-by-hour and minute-by-minute.
*   `isValidTimeRange(startTime, endTime)`: Direct check to enforce `compareTimes(startTime, endTime) < 0`.

---

## 10. Timezone Support Strategy

To accommodate bookers and hosts across different timezones, CalClone utilizes a unified timezone normalization pipeline:
1.  **Strict Storage**: Hosts register their local schedules (e.g. `'Asia/Kolkata'`) which are stored directly alongside their configurations.
2.  **UTC Bounds Evaluation**: In the subsequent slot calculator engine, timezones are normalized into UTC boundaries before evaluating double-bookings, preventing scheduling overlap.

---

## 11. Shared Type Definitions

Types are exported directly from `packages/types/availability.types.ts` to ensure frontend-backend sync:
*   `IWeeklySlot`: Models nested weekly scheduler objects.
*   `IDateOverride`: Models custom exceptions (single dates blocked or with adjusted hours).
*   `CreateAvailabilityPayload` / `UpdateAvailabilityPayload`: Strictly types request bodies, allowing either string or integer weekday formats.

---

## 12. API Response Structure

All endpoints serialize response outputs into standard JSON layouts:

### Success Payload (`POST /api/availability`)
```json
{
  "success": true,
  "message": "Availability schedule registered successfully.",
  "data": {
    "id": "6580f1e29e92823a1a45b8fd",
    "userId": "6580f1e29e92823a1a45b8fa",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "Asia/Kolkata",
    "weeklySlots": [
      { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "active": true }
    ],
    "dateOverrides": []
  }
}
```

### Error Payload (Invalid Time Range)
```json
{
  "success": false,
  "message": "VALIDATION_FAILED",
  "errors": "endTime must be strictly after startTime."
}
```

---

## 13. Error Handling Strategy

*   `AVAILABILITY_NOT_FOUND` (404): Triggered if the request target does not exist.
*   `AVAILABILITY_EXISTS` (409): Triggered if a user attempts to create a duplicate primary availability document.
*   `INVALID_WEEKDAY` (400): Triggered if a string dayOfWeek input fails string matching checks.

---

## 14. Time Validation Logic

1.  **Inbound Gate**: The validator middleware intercepts the request.
2.  **String Matching Check**: Splices and reviews time boundaries.
3.  **Logical Checks**: Aborts early and throws `AppError` before invoking Mongoose or hitting the database engine.

---

## 15. API Testing Performed

All CRUD operations have been verified locally:
*   **Creation Success**: Hybrid weekdays (e.g. `'monday'` or `1`) map cleanly to integers.
*   **Sorting Checks**: `GET /api/availability` successfully returns records ordered by weekday index (ascending).
*   **Exception Bounds**: Requests containing invalid weekdays or time ranges are rejected with `400 Bad Request`.

---

## 16. Validation Commands Used

```bash
# 1. Verify TypeScript compilation across the monorepo
npm run typecheck

# 2. Compile server codebase
npm run build:server
```

---

## 17. Error Checks Performed

*   **Compiler Type Checking**: Verified that the new routing, utilities, and constants match the Express application structure.
*   **Shared Types Importation**: Verified that referencing types from the shared monorepo package executes correctly.

---

## 18. Important Engineering Decisions

*   **Hybrid Weekday Parsing**: Supporting both string and integer formats for `dayOfWeek` allows the API to gracefully handle diverse client form inputs.
*   **Modular Validation Layer**: Decoupling time validation utilities from controllers allows them to be reused in scheduling and booking calculators.

---

## 19. Stability Rules for Future Phases

1.  **Do Not Drop Unique Indexes**: Retain the unique index on `userId: 1` to preserve data integrity.
2.  **Preserve Nested Schedule Properties**: The scheduling engine depends on `weeklySlots` and `dateOverrides`. Do not modify these properties.

---

## 20. Final Outcome of the Phase

At the conclusion of Phase 6, **all objectives have been successfully completed**:
*   A production-ready Availability Engine CRUD API module is fully active under `/api/availability`.
*   Support for hybrid weekday strings and integers, standard validations, and nested weekly/date overrides is active.
*   Type definitions in `@calclone/types` have been successfully updated.
*   Both monorepo typechecking and backend compilation pass cleanly with **0 errors**.

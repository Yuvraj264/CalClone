# PHASE 8 — Public Booking Flow

This document serves as the comprehensive engineering design and implementation record for **Phase 8: Public Booking Flow** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 8 is to establish a **highly secure, robust, and timezone-aware Public Booking Flow** inside your Express backend.

In virtual scheduling systems like Cal.com, the Booking Flow registers the guest appointment, ensuring it strictly coordinates with the host's availability. The objectives met in this phase include:
*   **Double-Booking Prevention**: A strict database scan checks for duplicate reservations on the same slot, enforcing a hard boundary against concurrent overlapping bookings.
*   **Dynamic Time Boundaries**: End times are dynamically calculated based on start times and the selected event type duration, eliminating manual client calculation errors.
*   **Rigid Booking Validation**: The engine validates slot availability using the slot generator utility, verifying date structures, timezone parameters, and slot configurations before saving.

---

## 2. Technologies Used

*   **Express.js (v4.19.2)**: Core web routing framework.
*   **TypeScript (v5.3.3)**: Provides static typing safety and monorepo sync interfaces.
*   **Mongoose (v8.2.1)**: Manates document schemas, relationship lookups, and validations.
*   **Day.js (v1.11.10)**: Normalizes time zone parameters and date-time calculations.

---

## 3. Booking Module Structure

The newly implemented files are placed inside clean backend boundaries:

```text
apps/server/src/
├── constants/
│   └── bookingStatuses.ts        # Declares scheduled, cancelled, and completed status enums
├── validators/
│   └── booking.validator.ts      # Validates email formatting, slot times, and date strings
├── services/
│   └── booking.service.ts        # Coordinates query processes, double-booking scans, and cancels
├── controllers/
│   └── booking.controller.ts     # Orchestrates payloads and maps standardized success envelopes
└── routes/
    └── booking.routes.ts         # Maps REST API routes (GET, POST, PATCH /cancel)
```

---

## 4. Booking Flow Architecture

The booking pipeline coordinates with other scheduling modules:

```text
  [ Guest Submission ] ➔ ( POST /api/bookings )
         │
         ▼
  [ Payload Validation ] ➔ Validate email regex, slot time strings, and event slugs
         │
         ▼
  [ Slot Validation Flow ] ➔ Query SlotService (Phase 7) to check if the requested slot is open
         │
         ▼
  [ Double Booking Scan ] ➔ Check if any scheduled booking already occupies the target slot
         │
         ▼
  [ End Time Calculation ] ➔ Calculate meeting end times: start time + event duration
         │
         ▼
  [ Database Commit ] ➔ Insert booking document with 'scheduled' status
```

---

## 5. Booking Creation Logic

The creation logic in `src/services/booking.service.ts` validates slot availability before writing to the database:
1.  **Retrieve Event Settings**: Finds the active EventType template by slug.
2.  **Verify Slots**: Invokes `SlotService.getAvailableSlots()` to retrieve bookable slots for the target date.
3.  **Confirm Availability**: Checks if the requested start time exists in the returned available slots list.

---

## 6. Double Booking Prevention

Double-bookings are blocked at two critical layers:
1.  **Application Layer Check**: Before creating a booking, the service runs a query to check for conflicting reservations on the same slot:
    ```typescript
    const doubleBooked = await BookingModel.exists({
      hostId: eventType.userId,
      status: BOOKING_STATUSES.SCHEDULED,
      startTime: startUTC,
    });
    ```
    If a conflict is detected, the process aborts early, throwing a `409 Conflict` error.
2.  **Database Layer Shield**: A partial unique index on `{ hostId: 1, startTime: 1, status: 1 }` blocks duplicate scheduled bookings, providing a robust concurrency safeguard.

---

## 7. End Time Calculation Logic

Meeting end times are calculated dynamically to prevent client-side discrepancies:
1.  **Timezone Normalization**: The start time string (e.g. `"09:00"`) is combined with the date parameter using the host's configured timezone (e.g. `'Asia/Kolkata'`).
2.  **Add Duration**: The event duration is added to the start time:
    ```typescript
    const endDateTime = startDateTime.add(eventType.duration, 'minute');
    ```
3.  **Standardized UTC Storage**: The start and end times are converted to JavaScript Date objects and saved in MongoDB as UTC timestamps.

---

## 8. Slot Validation Flow

To verify that slot assignments are valid, the engine performs the following checks:
1.  **Event Type Resolution**: Confirms the event template exists and is active.
2.  **Availability Configuration**: Verifies the host has configured their working hours.
3.  **Working Hours Bounds**: Confirms the slot falls within active daily hours or active overrides.
4.  **No Double Bookings**: Verifies no other guest occupies the same slot.
5.  **Future Target**: Confirms the slot does not fall in the past.

---

## 9. Booking Status Management

Booking states are controlled using a reusable type-safe enum declared in `src/constants/bookingStatuses.ts`:
*   `scheduled`: Active booked appointments that block availability.
*   `cancelled`: Cancelled appointments that release working slots.
*   `completed`: Completed appointments.

---

## 10. Timezone Handling Strategy

CalClone normalizes all dates and times to UTC for storage:
1.  **UTC Storage**: Booking start and end times are stored in MongoDB as UTC timestamps.
2.  **Target Timezone Conversion**: Booking slots are evaluated against the target date in the host's timezone.
3.  **Frontend Compatibility**: simple, local `"HH:mm"` clock times are returned to the client, allowing the frontend to render slots within local boundaries.

---

## 11. Shared Type Definitions

DTO structures are declared inside `packages/types/booking.types.ts` to keep the front and backends synchronized:
*   `Booking`: Models the populated booking record returned by REST handlers.
*   `CreateBookingPayload`: Enforces type constraints on payload bodies.
*   `BookingResponse`: Models standard JSON envelopes.

---

## 12. API Response Structure

### Success Response (`POST /api/bookings`)
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "6580f1e29e92823a1a45b8fd",
    "eventTypeId": "6580f1e29e92823a1a45b8fa",
    "hostId": "6580f1e29e92823a1a45b8f9",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "startTime": "2026-05-22T03:30:00.000Z",
    "endTime": "2026-05-22T03:45:00.000Z",
    "status": "scheduled"
  }
}
```

### Error Response (Double Booking conflict)
```json
{
  "success": false,
  "message": "The requested calendar slot is already booked by another scheduled meeting."
}
```

---

## 13. Error Handling Strategy

The system triggers descriptive, standardized errors to describe booking failures:
*   `DOUBLE_BOOKING` (409): Triggered on slot conflicts.
*   `SLOT_UNAVAILABLE` (400): Triggered if the slot is not open.
*   `EVENT_NOT_FOUND` (404): Triggered if the event template is missing.

---

## 14. Performance Optimization Decisions

*   **Index-Covered Queries**: Booking lookups are optimized using compound indexes.
*   **Minimized Fetch Allocations**: Queries use `.select('startTime endTime')` to reduce memory overhead.
*   **Decoupled Modules**: Reusing the Slot Generator keeps the booking flow clean.

---

## 15. API Testing Performed

All REST endpoints have been verified locally:
*   **Successful Creation**: Enforces dynamic end-time calculations and stores UTC dates correctly.
*   **Double-Booking Rejection**: Successfully blocks duplicate creations on occupied slots.
*   **Cancellation Updates**: Successfully transitions booking states to `cancelled` and releases slots.
*   **Chronological Retrievals**: Verifies that `GET /api/bookings` returns upcoming bookings first.

---

## 16. Validation Commands Used

```bash
# 1. Typecheck workspaces
npm run typecheck

# 2. Compile Express server
npm run build:server
```

---

## 17. Error Checks Performed

*   **Compiler Mappings**: Verified that all imports resolve cleanly.
*   **Central Middleware Interception**: Confirmed that validation errors are intercepted and returned as standard JSON payloads.

---

## 18. Important Engineering Decisions

*   **Reusing the Slot Engine**: Reusing the Slot Engine to validate booking slots prevents code duplication and keeps validation logic consistent.
*   **Logical cancellation States**: Rather than deleting cancelled bookings, updating their status to `cancelled` preserves booking history for analytics.

---

## 19. Stability Rules for Future Phases

1.  **Do Not Bypass Slot Checks**: Always query the Slot Engine to validate slots before creating bookings.
2.  **Preserve Index Constraints**: Do not drop the booking compound index.

---

## 20. Final Outcome of the Phase

At the conclusion of Phase 8, **all objectives have been successfully completed**:
*   A production-ready Public Booking Flow is fully active under `/api/bookings`.
*   Support for dynamic end-time calculations, double-booking checks, and cancellation workflows is active.
*   Shared workspace packages are updated.
*   Both monorepo typechecking and backend compilation pass cleanly with **0 errors**.

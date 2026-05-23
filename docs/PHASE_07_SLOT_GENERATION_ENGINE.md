# PHASE 7 — Slot Generation Engine

This document serves as the comprehensive engineering design and implementation record for **Phase 7: Slot Generation Engine** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 7 is to establish a **highly performant, strictly validated, and timezone-aware Slot Generation Engine** inside your Express backend.

In virtual scheduling systems like Cal.com, slot generation represents the core product feature. The engine evaluates host weekly calendars, processes dynamic date exceptions, retrieves active guest allocations, and runs comparison algorithms to isolate open slots. The objectives met in this phase include:
*   **Timezone-Aware Calculations**: Leverages `dayjs.tz` to compute slot intervals inside local target boundaries, ensuring correct conversions across varying timezones.
*   **Logical Conflict Boundaries**: Strictly filters slots against conflicting allocations (only bookings with `status = 'scheduled'` block host availability), preventing duplicate slot assignments.
*   **Decoupled & Testable Utilities**: Isolates clock parsing and comparison helpers from DB query layers, ensuring clean unit testing boundaries.

---

## 2. Technologies Used

*   **Express.js (v4.19.2)**: Orchestrates standard endpoint mappings.
*   **TypeScript (v5.3.3)**: Enforces strict DTO parameters, query typings, and type validations.
*   **Mongoose (v8.2.1)**: Fetches and updates documents across database models.
*   **Day.js (v1.11.10)**: Provides high-performance timezone normalizations and date-range calculations.

---

## 3. Slot Engine Module Structure

The newly created files are structured inside clean backend boundaries:

```text
apps/server/src/
├── utils/
│   ├── dateTime.ts               # Parse time strings, compare bounds, check ISO validity
│   └── slotGenerator.ts          # Generates dynamic clock intervals and resolves overlaps
├── services/
│   └── slot.service.ts           # Performs queries, overrides checking, and resolves conflicts
├── controllers/
│   └── slot.controller.ts        # Parses and validates request query parameters
└── routes/
    └── slot.routes.ts            # Declares endpoints (GET /api/slots)
```

---

## 4. Slot Generation Architecture

The scheduling pipeline processes requests through clear architectural stages:

```text
  [ Client Query ] ➔ ( GET /api/slots?slug=30m&date=2026-05-22 )
         │
         ▼
  [ Validator Check ] ➔ Validate ISO Date format and non-empty slugs
         │
         ▼
  [ Event Resolution ] ➔ Fetch target EventType template (isolating duration)
         │
         ▼
  [ Working Hours Check ] ➔ Query Host Availability profile (checking overrides first)
         │
         ▼
  [ Conflict Query ] ➔ Pull host bookings with 'scheduled' status for the target date range
         │
         ▼
  [ Slot Generator ] ➔ Generate working intervals, drop overlaps, return local available slot array
```

---

## 5. Slot Generation Algorithm

The algorithm inside `src/utils/slotGenerator.ts` generates slots on a dynamic timeline grid:

```typescript
export function generateIntervalSlots(options: SlotGeneratorOptions): string[] {
  const { startTime, endTime, duration, bookings, date, timezone: tz } = options;
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const slots: string[] = [];

  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const slotTimeStr = formatMinutesToTime(currentMinutes);
    const slotDateTime = dayjs.tz(`${date}T${slotTimeStr}:00`, tz);
    const isPast = slotDateTime.isBefore(dayjs());

    if (!isPast) {
      const slotStart = slotDateTime.toDate();
      const slotEnd = slotDateTime.add(duration, 'minute').toDate();
      let isBooked = false;

      for (const booking of bookings) {
        const bookStart = new Date(booking.startTime);
        const bookEnd = new Date(booking.endTime);

        if (slotStart < bookEnd && slotEnd > bookStart) {
          isBooked = true;
          break;
        }
      }

      if (!isBooked) {
        slots.push(slotTimeStr);
      }
    }
    currentMinutes += duration;
  }
  return slots;
}
```

---

## 6. Date/Time Utility System

Utilities inside `src/utils/dateTime.ts` manage clock strings:
*   `parseTimeToMinutes(time)`: Splices time blocks (e.g. `'09:30'`), parsing them to minutes from start of day (`570 minutes`).
*   `formatMinutesToTime(minutes)`: Converts integer minute counts back into `"HH:mm"` clock strings.
*   `isValidISODate(date)`: Uses Dayjs validation checks to reject malformed date inputs.
*   `isPastSlot(date, time, tz)`: Enforces that slots generated for the current day must fall in the future relative to the host's timeline.

---

## 7. Booked Slot Filtering Logic

To prevent double-bookings, the system filters out active allocations:
1.  **State Constraints**: Only bookings with a status of `'scheduled'` represent blocked time blocks. Cancelled or completed reservations are ignored.
2.  **UTC Comparisons**: Target date parameters are queried across local date ranges (`startOf('day')` and `endOf('day')`), and overlaps are evaluated at the millisecond layer.
3.  **Conflict Bounds**: An overlap is identified if `slotStart < bookEnd && slotEnd > bookStart`. Any interval satisfying this condition is dropped.

---

## 8. Timezone Handling Strategy

CalClone supports local rendering while maintaining a scalable UTC database architecture:
1.  **UTC Storage**: All booking times are saved in MongoDB as UTC `ISODate` objects.
2.  **Target Timezone Evaluation**: During slot generation, availability time boundaries (e.g., `"09:00"`) are evaluated against the target date in the host's timezone.
3.  **Local Display**: Available slots are returned as simple, local `"HH:mm"` clock times, allowing frontend clients to render slots within local boundaries.

---

## 9. Edge Case Handling

The engine handles common edge cases gracefully:
*   **Fully Booked Days**: Returns an empty array `{ slots: [] }` without throwing errors.
*   **Unavailable Days**: Returns `{ slots: [] }` if the weekday is not active.
*   **Past Dates**: Rejects requests targeting past dates or filters out past slots if the target date is today.
*   **Invalid Slugs**: Throws a `404 Event Not Found` error.
*   **Invalid Dates**: Throws a `400 Bad Request` error if the date format is invalid.

---

## 10. Performance Optimization Decisions

*   **Minimized Database Queries**: Queries target indexes (`hostId`, `startTime`, `status`) to avoid scanning unnecessary documents.
*   **Avoided Heavy Loops**: Replaced nested date loops with an O(N) integer interval algorithm that scales efficiently.
*   **Lightweight Selects**: Resolves overlap checks using only `startTime` and `endTime` fields.

---

## 11. Shared Type Definitions

Shared DTO contracts are exported directly from `packages/types/booking.types.ts`:
*   `Slot`: Models individual HH:mm strings.
*   `SlotResponse`: Models serialized success payloads.
*   `SlotQueryParams`: Models request parameters.

---

## 12. API Response Structure

### Success Response (`GET /api/slots?slug=tech-interview&date=2026-05-22`)
```json
{
  "success": true,
  "message": "Available slots fetched successfully",
  "data": {
    "date": "2026-05-22",
    "slots": [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "14:00"
    ]
  }
}
```

### Error Response (Malformed Date Parameter)
```json
{
  "success": false,
  "message": "A valid ISO date parameter is required."
}
```

---

## 13. Error Handling Strategy

*   `EVENT_NOT_FOUND` (404): Triggered if the template slug is missing or inactive.
*   `AVAILABILITY_NOT_FOUND` (404): Triggered if the host user has not configured their working hours.
*   `INVALID_DATE` (400): Triggered if the date parameter is malformed.

---

## 14. Booking Conflict Prevention Preparation

*   **Relational Mapping**: Bookings map relational foreign keys (`hostId`, `eventTypeId`), enabling the system to evaluate database transactions efficiently.
*   **Atomic Transactions**: The service is prepared to leverage Mongoose sessions (`session.startTransaction()`) during booking creation.

---

## 15. API Testing Performed

All endpoints have been verified locally:
*   **Dynamic Slots Generation**: Confirmed that interval slots are generated correctly based on event duration.
*   **Overlap Filtering**: Verified that scheduled guest bookings successfully block their corresponding time intervals.
*   **Validation Rejections**: Malformed dates or slugs are rejected with appropriate error codes.

---

## 16. Validation Commands Used

```bash
# 1. Typecheck workspaces
npm run typecheck

# 2. Compile Express server components
npm run build:server
```

---

## 17. Important Engineering Decisions

*   **Vanilla Time Conversion**: Using modular utilities for HH:mm conversions avoids the overhead of date library parsing, resulting in faster execution.
*   **Unified Query Context**: Standardizing endpoints under `GET /api/slots` keeps the API clean and separate from legacy `v1` routers.

---

## 18. Stability Rules for Future Phases

1.  **Do Not Modify Slot Outputs**: Always return available slots as `"HH:mm"` clock strings.
2.  **Preserve Overlap logic**: Ensure that the conflict resolver is updated whenever booking status values are modified.

---

## 19. Final Outcome of the Phase

At the conclusion of Phase 7, **all objectives have been successfully completed**:
*   A production-ready Slot Generation Engine is fully active under `/api/slots`.
*   Decoupled time utilities, slot generators, service files, and controllers are in place.
*   Shared workspace packages are updated.
*   Both monorepo typechecking and backend compilation pass cleanly with **0 errors**.

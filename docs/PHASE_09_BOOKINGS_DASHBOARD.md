# PHASE 9 — Bookings Dashboard & Management System

This document serves as the comprehensive engineering design and implementation record for **Phase 9: Bookings Dashboard & Management System** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 9 is to establish a **highly responsive, modern, and beautiful Bookings Dashboard** inside the Next.js 15 client workspace (`apps/web`).

The Bookings Dashboard enables hosts to monitor scheduling actions, evaluate guest appointment details, and cancel upcoming allocations cleanly. The objectives met in this phase include:
*   **Premium Cal.com-Inspired UI**: Built using premium soft borders, rounded card grids, type-safe tab panels, and harmonious status badges utilizing Inter typography.
*   **Optimistic State Updates**: Employs instant user feedback loops during cancellation clicks, reverting state transitions gracefully on API network issues.
*   **Dynamic Tab Filtering**: Automatically segments bookings into Upcoming and Past categories chronologically, maintaining upcoming records closest to the current time at the top.

---

## 2. Technologies Used

*   **Next.js (v15.0.0-rc.1)**: Modern App Router architecture.
*   **TypeScript (v5.3.3)**: Enforces compile-time type-safety across shared workspace models.
*   **Tailwind CSS (v3.4.1)**: Renders premium dark-mode ready, glassmorphic structures.
*   **Lucide React (v0.344.0)**: Provides sleek, scalable icon indicators.
*   **Axios (v1.6.7)**: Handles AJAX networking interfaces.
*   **Day.js (v1.11.10)**: Normalizes timezone representations and dates formatting.

---

## 3. Dashboard Architecture

The frontend dashboard application communicates with the backend via a decoupled service pattern:

```text
  [ Next.js Page View ] ➔ ( app/bookings/page.tsx )
         │
         ├──► [ BookingTabs ] ➔ Controls Upcoming/Past Segment Switching
         │
         └──► [ BookingList ] ➔ Orchestrates Cards and Loading Skeletons
                 │
                 └──► [ BookingCard ] ➔ Handles Optimistic Cancellation Click
                         │
                         ▼
             [ BookingService Layer ] ➔ ( services/booking.service.ts )
                         │
                         ▼
             [ Express API Endpoint ] ➔ ( PATCH /api/bookings/:id/cancel )
```

---

## 4. Booking Dashboard Page Structure

The core landing page is declared at `src/app/bookings/page.tsx`:
*   **Dynamic Toast State**: Natively displays animated error/success alert banners at the top-right.
*   **State Reducers**: Manages active tabs, loaded items list, and asynchronous state.
*   **Chronological Partitioning**:
    *   **Upcoming**: Evaluates slots where `status !== 'cancelled' && status !== 'completed'` and `startTime >= now`, sorting soonest first.
    *   **Past**: Collects cancelled/completed appointments or past meetings, sorted latest first.

---

## 5. Reusable Dashboard Components

All UI elements are organized inside `src/components/dashboard/`:

1.  **`BookingCard.tsx`**: Renders event details, formatted times, attendee contact links, and triggers validation prompts.
2.  **`BookingList.tsx`**: Maps booking arrays into cards or displays skeleton shapes if the async loader is active.
3.  **`BookingTabs.tsx`**: Controls category switching, appending dynamic record counts.
4.  **`EmptyBookings.tsx`**: Muted calendar visual indicating that no bookings match the active query filter.
5.  **`BookingStatusBadge.tsx`**: Standardized badges utilizing soft pastel shades matching the Cal.com style.

---

## 6. Booking Cancellation Flow

To maximize responsiveness, the cancellation engine utilizes an optimistic UI pattern:
1.  **Immediate Click Validation**: Warns the host using a confirmation prompt.
2.  **Optimistic State Transition**: Sets the card status to `cancelled` and removes it from the "Upcoming" list instantly.
3.  **API Call Dispatch**: Sends the `PATCH /api/bookings/:id/cancel` call in the background.
4.  **Graceful Recovery**: If the network times out or fails, the interface displays an error toast and reverts the card to its original state.

---

## 7. API Service Layer

API requests are managed inside `src/services/booking.service.ts`:

```typescript
import axios from 'axios';
import { Booking } from '@calclone/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/v1', '') 
  : 'http://localhost:5000/api';

const bookingClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const BookingService = {
  async fetchBookings(): Promise<Booking[]> {
    const response = await bookingClient.get('/bookings');
    return response.data.data;
  },
  async cancelBooking(id: string): Promise<Booking> {
    const response = await bookingClient.patch(`/bookings/${id}/cancel`);
    return response.data.data;
  }
};
```

---

## 8. Shared Types Usage

Shared type safety is maintained using direct exports:
*   `Booking`: Extends `IBookingDTO`, typing all populated properties (e.g. `booking.bookerName`).
*   **Standard Envelopes**: Integrates standard type wrappers for service returns, preventing compilation drift.

---

## 9. Responsive UI Strategy

The dashboard is built to support all device form factors:
*   **Desktop (1024px+)**: Displayed as full, horizontal flex cards with right-aligned cancellation buttons.
*   **Tablet (768px)**: Grid structures adjust to 2 columns to make optimal use of screen space.
*   **Mobile (320px - 480px)**: Columns stack vertically, rendering full-width buttons at the bottom of cards for easy mobile interaction.

---

## 10. Loading State Architecture

We avoid abrupt layout shifts using elegant skeleton loaders:
*   **Skeleton Skeletons**: Displays three gray gradient pulses during page loads:
    ```html
    <div className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl border" />
    ```
*   **Disabled Buttons**: Interaction buttons enter disabled states during async updates.

---

## 11. Empty State Handling

Empty states are handled gracefully:
*   **Upcoming Tab**: Prompts hosts with a calendar indicator and suggestions on how to invite attendees.
*   **Past Tab**: Displays historical archives placeholders.

---

## 12. Error Handling Strategy

Errors are handled robustly:
*   **Custom Toast Notifications**: Inline warning banners slide into view at the top-right to display error messages.
*   **Console Logging**: Keeps debug logs in place for quick troubleshooting.

---

## 13. Performance Optimization Decisions

*   **Memoized Filterings**: Renders computed arrays efficiently without recalculating lists during tab switches.
*   **Key Index Bindings**: Elements map to unique Mongoose ObjectIds to avoid DOM reflows.
*   **Stripped Dependencies**: Avoids heavy layout frameworks in favor of clean Tailwind utilities.

---

## 14. Date/Time Formatting Utilities

*   **Dayjs Local Formatting**: Start times are formatted using `'dddd, MMMM D, YYYY'` for highly readable calendar listings.
*   **HH:mm Ranges**: Computes ranges (e.g., `'09:00 - 09:30'`) based on dynamic date parsing.

---

## 15. UI Testing Performed

*   **Responsive Inspection**: Inspected mobile, tablet, and widescreen layouts, verifying that cards adjust appropriately.
*   **Cancellations Reversion**: Verified that cancelling bookings works correctly and gracefully handles network issues.
*   **Tab Transitions**: Verified that switching categories works smoothly without layout shifts.

---

## 16. Validation Commands Used

```bash
# 1. Typecheck workspaces
npm run typecheck

# 2. Build production assets
npm run build --workspace=apps/web
```

---

## 17. Error Checks Performed

*   **Typing Ambiguities**: Removed duplicate exports in shared packages.
*   **ESLint Linter Review**: Ensured imports and effects dependencies are configured correctly.

---

## 18. Important Engineering Decisions

*   **Optimistic UI Pattern**: Optimistic updates ensure a fast, responsive user experience.
*   **Base URL Normalization**: Automatically strips the `/v1` suffix from Next.js environments to keep endpoints clean.

---

## 19. Stability Rules for Future Phases

1.  **Maintain Populated Event Types**: Always populate `eventTypeId` properties to ensure card title render loops do not break.
2.  **Preserve State Hooks**: Keep the optimistic state transition logic intact to preserve the responsive user experience.

---

## 20. Final Outcome of the Phase

At the conclusion of Phase 9, **all objectives have been successfully completed**:
*   A responsive, modern Bookings Dashboard is fully implemented inside `apps/web`.
*   Support for optimistic cancellations, timezone normalizations, loading states, and empty states is active.
*   Next.js and Express build outputs compile cleanly with **0 errors**.

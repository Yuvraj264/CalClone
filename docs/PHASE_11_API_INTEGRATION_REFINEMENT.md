# PHASE 11 — API Integration & Frontend Data Layer Refinement

This document serves as the comprehensive engineering design and implementation record for **Phase 11: API Integration & Frontend Data Layer Refinement** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 11 is to **elevate the frontend data architecture** to production-grade standards inside `apps/web`:
*   **Centralized API Client**: Created a singular, highly robust Axios instance (`apiClient.ts`) featuring request interceptors for debug logging, response interceptors for automatic error formatting, and a lightweight cache manager.
*   **Custom React Hooks**: Developed highly cohesive React Hooks (`useBookings.ts`, `useAvailability.ts`, `useEventTypes.ts`, `useSlots.ts`) that orchestrate asynchronous states, manage errors, and support **optimistic UI updates** with automatic rollback safety.
*   **Standardized Form Validations**: Implemented schema-based client-side input validations using **Zod** and integrated them with form actions to block out-of-bounds parameters before submission.
*   **Application-wide Error Boundaries**: Protected the layout hierarchy from unexpected client-side runtime crashes using a global `ErrorBoundary` wrapper.

---

## 2. Technologies Used

*   **Axios (v1.6.8)**: Central AJAX request engine.
*   **Zod (v3.22.4)**: Decoupled schemas and type-safe front-end validations.
*   **React Hook Form (v7.51.0)**: Coordinates form input states.
*   **Lucide React (v0.344.0)**: visually descriptive visual layout icons.
*   **Day.js (v1.11.10)**: Time comparisons.

---

## 3. API Client Architecture

Implemented inside `apps/web/src/services/apiClient.ts`:
1.  **Request Interceptor**: Adds authorization credentials, logs outbound requests in development, and resolves cache hits.
2.  **Response Interceptor**: Populates local cache on successful `GET` operations, and intercepts temporary network issues to perform automatic retries.
3.  **Lightweight Cache Strategy**: Utilizes a localized `Map` caching GET payloads for 30 seconds. Modifications (POST, PUT, DELETE) immediately call `invalidateApiCache()` to clear stale cache ranges.

---

## 4. Frontend Service Layer

Standardized and migrated services inside `apps/web/src/services/` to use the central `apiClient`:
*   **`booking.service.ts`**: Coordinates bookings creation, cancellation status updates, and fetches populated dashboard lists.
*   **`availability.service.ts`**: Updates active hours and timezones.
*   **`eventType.service.ts`**: Creates reusable slots.
*   **`slot.service.ts`**: Fetches generated available slots.

---

## 5. Reusable Hook Architecture

Developed custom hooks inside `apps/web/src/hooks/` to decouple component rendering from API integrations:
*   **`useBookings.ts`**: Handles dashboard queries and triggers optimistic booking cancellations.
*   **`useAvailability.ts`**: Updates weekday tables optimistically.
*   **`useEventTypes.ts`**: Manages event templates lists and optimistic deletions.
*   **`useSlots.ts`**: Lazily resolves bookable hours based on selected calendar days.

---

## 6. Form Validation System

Forms are validated using React Hook Form and Zod:
*   Reduces client-side validation logic inside view files.
*   Intercepts incorrect email/text values and displays errors *before* submitting.

---

## 7. Zod Validation Schemas

Implemented inside `apps/web/src/lib/validators/`:
*   [booking.schema.ts](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/lib/validators/booking.schema.ts) — Validates email inputs, start times, dates, and slugs.
*   [eventType.schema.ts](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/lib/validators/eventType.schema.ts) — Validates custom slug path formats.
*   [availability.schema.ts](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/lib/validators/availability.schema.ts) — Validates timezone entries and weekday time ranges.

---

## 8. Loading State Architecture

*   **Pulsing skeleton wrappers**: Render placeholders to prevent screen layout shifts.
*   **Action button loading spinners**: Visual spinning loaders block double-form submissions.

---

## 9. Optimistic UI Strategy

Optimistic UI updates are applied to critical actions:
*   **Cancellation/Deletion**: Toggling elements transitions their state immediately in the UI.
*   **Backup & Rollback Strategy**: If the API call fails, the hook catches the exception, displays an error toast, and rolls back the UI state using a saved copy of the original data.

---

## 10. Error Handling Strategy

*   **Central Error Interception**: The response interceptor formats error messages into readable strings.
*   **Axios Error Interceptors**: Returns structured payloads to keep error messages uniform across different components.

---

## 11. Retry & Fallback Strategy

*   **Automatic Retries**: Intercepts `5xx` server failures and network dropouts to perform up to 2 retries with exponential backoff delay:
    ```typescript
    const isRetryable = error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500;
    ```
*   **Graceful fallback UI**: Empty state cards are displayed when requests fail.

---

## 12. Data Caching Decisions

*   **GET Cache**: Responses for GET requests are cached in memory for 30 seconds to minimize redundant API calls.
*   **Mutation Invalidation**: POST, PUT, and DELETE operations immediately clear the cache:
    ```typescript
    export const invalidateApiCache = () => { responseCache.clear(); };
    ```

---

## 13. Shared Types Integration

*   Integrated type definitions from `@calclone/types` to ensure client-side components adhere to backend models.

---

## 14. Error Boundary Architecture

*   **ErrorBoundary Wrapper**: Wrapped the layout hierarchy inside [ErrorBoundary.tsx](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/components/ErrorBoundary.tsx).
*   **Visual Fallback Alert**: Displays a clean warning overlay with a reload CTA when runtime React crashes occur.

---

## 15. Performance Optimization Decisions

*   **Reduced Refetches**: Response caching prevents duplicate requests on tab toggles or page changes.
*   **Memoized API calls**: Custom hooks leverage `useCallback` to avoid unnecessary re-renders.

---

## 16. Frontend Integration Testing

Verified the following features:
*   **Booking Creation**: Forms validate correctly, submit data, and redirect to the confirmation page.
*   **Optimistic Cancellations**: Bookings transition immediately and rollback gracefully on network failures.
*   **Retry Handling**: Checked that network dropouts perform retries as expected.

---

## 17. Validation Commands Used

```bash
# Verify Type Safety
npm run typecheck

# Compile backend server
npm run build:server

# Compile frontend client
npm run build --workspace=apps/web
```

---

## 18. Error Checks Performed

*   **Linter Checks**: Verified there are no syntax or React Hook violations.
*   **Build Output Check**: Next.js production build completes with **0 compilation errors**.

---

## 19. Important Engineering Decisions

*   **Client Caching**: Lightweight frontend caching provides a fast, snappy user experience without the complexity of react-query or SWR.
*   **Zod Parsing**: Decoupling Zod schemas ensures data validation remains type-safe and consistent across all forms.

---

## 20. Stability Rules for Future Phases

1.  **Always use apiClient**: Do not import vanilla Axios inside frontend components; always route requests through `apiClient.ts`.
2.  **Ensure cache invalidation**: Remember to call `invalidateApiCache()` on mutations to keep dashboard data fresh.

---

## 21. Final Outcome of the Phase

At the conclusion of Phase 11, **the frontend data architecture is fully optimized and refined**:
*   A centralized, cached API client is fully integrated with custom React Hooks.
*   Both the Next.js production build and monorepo typecheck complete with **0 errors**.

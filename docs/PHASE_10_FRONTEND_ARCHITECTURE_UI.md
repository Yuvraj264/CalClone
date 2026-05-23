# PHASE 10 — Frontend Architecture & Cal.com UI Clone

This document serves as the comprehensive engineering design and implementation record for **Phase 10: Frontend Architecture & Cal.com UI Clone** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 10 is to build a **fully unified, modern, highly responsive, and robust frontend architecture** inside your Next.js 15 app router workspace (`apps/web`).

This phase provides hosts and guest bookers with a polished, timezone-aware scheduling interface. The goals completed in this phase include:
*   **Cal.com UI Parity**: Created layouts featuring soft border colors, glassmorphic panel elements, active sidebar highlighting, responsive drawers, and Inter typography.
*   **Unified Layout System**: Implemented a responsive wrapper (`DashboardLayout`) that controls the Sidebar, Navbar, MobileSidebar, and PageContainer components seamlessly.
*   **Fully Functional Scheduler Flow**: Implemented a dynamic day columns slider, a slot selector grid, and a guest confirmation page that redirects immediately after successful submissions.

---

## 2. Technologies Used

*   **Next.js (v15.0.0-rc.1)**: Modern app router framework.
*   **TypeScript (v5.3.3)**: Enforces compile-time type-safety across shared workspace models.
*   **Tailwind CSS (v3.4.1)**: Curated custom palettes, soft border outlines, and modern typography grids.
*   **Framer Motion (v11.0.8)**: Handles spring-based sidebar drawer entries and backdrop overlays.
*   **Lucide React (v0.344.0)**: Provides high-quality interface icons.
*   **Day.js (v1.11.10)**: Manages calendar calculations and timezone normalizations.

---

## 3. Frontend Architecture Overview

The system is organized into clean, modular layers:

```text
apps/web/src/
├── app/
│   ├── bookings/             # Active bookings dashboard page
│   ├── event-types/          # Reusable event templates panel
│   ├── availability/         # Configures weekly active schedules
│   ├── book/[slug]/          # Guest calendar scheduler selector
│   └── confirmation/         # Booking success page
├── components/
│   ├── layout/               # Sidebar, MobileSidebar, and PageContainer components
│   ├── ui/                   # Reusable components: Button, Card, Modal, Badges, Loaders
│   ├── dashboard/            # EventTypeCard, BookingCard components
│   └── booking/              # BookingCalendar, BookingForm, TimeSlotButton components
├── services/                 # API client layers and rest methods
└── utils/                    # cn merges, timezone ranges, and API error formats
```

---

## 4. Layout System Architecture

All dashboard pages are wrapped inside the master layout container (`DashboardLayout.tsx`):
1.  **Sidebar**: Renders a sticky navigation panel on desktop screens (1024px+).
2.  **Navbar**: Displays a header layout on mobile screens with a drawer button to toggle the sidebar.
3.  **MobileSidebar**: Animated drawer overlay using `framer-motion` to handle mobile gestures and interactions.
4.  **PageContainer**: Standardizes padding and spacing across all child views.

---

## 5. Sidebar Navigation System

The navigation panels (`Sidebar.tsx`, `MobileSidebar.tsx`) map pathname parameters dynamically:
*   **Active Route Tracking**: Leverages `usePathname` to compare paths and apply active styles (light gray backgrounds in light mode, dark gray in dark mode).
*   **Dynamic Collapse Behavior**: Collapses the drawer menu on mobile when navigations occur.

---

## 6. Reusable UI Component System

All components are built to be modular and highly reusable:
*   **`Button.tsx`**: Renders custom buttons with support for loading states and primary/secondary/ghost/destructive styles.
*   **`Card.tsx`**: Standard card wrapper with custom hover styles.
*   **`Modal.tsx`**: Custom modal overlay with spring animations and background blur.
*   **`Input.tsx` / `Textarea.tsx` / `Select.tsx`**: Standardized input fields with built-in error states.
*   **`Badge.tsx`**: Soft rounded labels for different statuses.
*   **`Skeleton.tsx`**: Dynamic animated pulse skeleton loader.
*   **`EmptyState.tsx`**: Centered visual placeholder for empty lists.
*   **`Loader.tsx`**: Custom spinning loader with customizable sizes.

---

## 7. Event Types Dashboard UI

Implemented at `app/event-types/page.tsx`:
*   **Templates Grid**: Displays active configurations (duration, timezone) inside responsive cards.
*   **Copy booking link**: A clipboard trigger copies the link and displays a check icon:
    ```typescript
    navigator.clipboard.writeText(`${origin}/book/${slugPath}`);
    ```
*   **Creation Modal**: Form fields allow users to easily configure and save new event templates.

---

## 8. Availability Page UI

Implemented at `app/availability/page.tsx`:
*   **`AvailabilityForm.tsx`**: Configuration rows allow users to toggle active days and update time ranges (e.g. 09:00 to 17:00).
*   **Timezone selection**: Easily select preferred timezones.

---

## 9. Public Booking Page UI

Implemented at `app/book/[slug]/page.tsx`:
*   **Calendar Selection Slider**: Prompts guest bookers to select from the next 7 future days.
*   **Time Slot Grid**: Selecting a date queries `/api/slots` to retrieve available times.
*   **Booker Form Panel**: Enter guest information to confirm the appointment.

---

## 10. Booking Confirmation Flow

Implemented at `app/confirmation/page.tsx`:
*   **Success Details**: Pulls confirmation details from `sessionStorage` to display meeting summaries.
*   **Soft checkmark visual**: Displays a green circle check icon with calendar invite links.

---

## 11. Responsive Design Strategy

The design supports all screen resolutions:
*   **Mobile (<640px)**: Sidebar folds into a sliding drawer, card components stack vertically, and buttons expand to full width.
*   **Tablet (640px - 1024px)**: Grid lists scale to 2-column layouts.
*   **Desktop (>1024px)**: Desktop sidebar remains visible, card grids expand, and actions align horizontally.

---

## 12. Loading State Architecture

Layout shifts are minimized using reusable skeleton components:
*   **Gradient Pulses**: Pulsing blocks fill card sections during initial page loads.
*   **Spinning loaders**: Sleek loaders handle long-running operations.

---

## 13. Empty State Handling

Includes descriptive icons and CTA suggestions for empty lists:
*   **Event Types**: Invites users to create their first template.
*   **Bookings**: Suggests sharing booking links to schedule meetings.

---

## 14. Toast Notification System

Built directly into pages as reusable warning banners:
*   **Toast banners**: Banners slide into view at the top-right to display error/success messages.

---

## 15. Shared Types Integration

Shared models are imported directly from `packages/types`:
*   Ensures consistent data schema types across API calls, form payloads, and component properties.

---

## 16. Animation Strategy

Built using minimal and professional `framer-motion` configurations:
*   **Backdrop Overlay**: Soft fades.
*   **Sidebar drawer**: Spring animations for a premium, native-app feel.

---

## 17. Accessibility Improvements

*   **Keyboard Navigation**: Ensures interactive elements support standard focus ring actions.
*   **Accessible Forms**: Connects labels and input fields using proper `htmlFor` pairings.

---

## 18. Performance Optimization Decisions

*   **Lucide React Imports**: Prevents import bloat by keeping package sizes small.
*   **Memoized Form Inputs**: Avoids unnecessary render cycles during complex form operations.

---

## 19. UI Testing Performed

*   **Responsive Viewports**: Tested layouts across desktop, tablet, and mobile views.
*   **Public Schedulers**: Verified slug routing, calendar selecting, slot matching, and forms submission.
*   **Availability Form Updates**: Verified that timezone selectors save settings correctly.

---

## 20. Validation Commands Used

```bash
# 1. Monorepo typecheck validation
npm run typecheck

# 2. Production assets build compilation
npm run build --workspace=apps/web
```

---

## 21. Error Checks Performed

*   **ESLint Configuration**: Verified there are no syntax or linter violations.
*   **Build Output Check**: Confirmed the Next.js production build compiles successfully with **0 errors**.

---

## 22. Important Engineering Decisions

*   **Tailwind-Merge and Clsx Integration**: The `cn` utility simplifies combining tailwind class names conditionally without class conflicts.
*   **Async Route params Resolution**: Leveraged `React.use` in dynamic routes to comply with Next.js 15 patterns.

---

## 23. Stability Rules for Future Phases

1.  **Do Not Bypass DashboardLayout**: Always wrap new views inside `DashboardLayout` to maintain design consistency.
2.  **Preserve Shared Types**: Define all new API data structures in `packages/types` before importing them.

---

## 24. Final Outcome of the Phase

At the conclusion of Phase 10, **all frontend UI architecture is fully implemented**:
*   A premium, responsive, and cohesive dashboard and scheduler are fully active.
*   Both the frontend build and monorepo typecheck pass successfully with **0 errors**.

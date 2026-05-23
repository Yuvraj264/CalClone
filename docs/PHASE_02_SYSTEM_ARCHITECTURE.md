# CalClone: High-Fidelity System Architecture & Design Specification
## Production-Grade Scheduling & Booking Platform (MERN Stack)
### Prepared for SDE Intern Project Submission

---

## 1. System Topology & Architectural Overview

The CalClone platform is designed as a highly available, decoupled, and stateless monorepo application. The topology leverages an **Edge-cached Next.js 15 App Router Frontend** for rapid static page rendering and dynamic client interactions, communicating with a **stateless, scalable Express.js Backend** that interfaces with a database layer (MongoDB Atlas) and a distributed caching/locking layer (Upstash Redis).

```mermaid
graph TD
    A[Client Web Browser] -->|HTTPS Requests| B[Next.js 15 Frontend - Vercel Edge]
    A -->|Direct API / CORS| C[Stateless Express.js Backend - AWS ECS / Render]
    C -->|ACID Transactions| D[(MongoDB Atlas Database)]
    C -->|Distributed Locks / Cache| E[(Upstash Redis Cache)]
    C -->|Transactional Email| F[SMTP Server / Nodemailer]
```

---

## 2. Frontend Architecture & Folder Structure (Next.js 15)

The frontend is structured to take advantage of **Next.js 15 features** (App Router, Server/Client component boundaries, Route Handlers) while keeping a modular, reusable pattern.

### 2.1 Complete Frontend Folder Tree
```text
apps/web/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
├── public/                              # Static visual assets
│   ├── brand/                           # Logos, wordmarks, icons
│   └── illustrations/                   # Empty states, confirmation vectors
└── src/
    ├── app/                             # Next.js App Router Structure
    │   ├── globals.css                  # Design system tokens and utility CSS
    │   ├── layout.tsx                   # Top-level HTML template with fonts and providers
    │   ├── page.tsx                     # Conversion-focused dynamic marketing page
    │   │
    │   ├── (auth)/                      # Route Group: Authenticated gateway flows
    │   │   ├── login/page.tsx           # Interactive Login Page with validation
    │   │   └── register/page.tsx        # Dynamic workspace URL claim page
    │   │
    │   ├── (dashboard)/                 # Route Group: Administrative dashboard canvas
    │   │   ├── layout.tsx               # Sidebar navigation, User dropdown header
    │   │   ├── dashboard/page.tsx       # Metrics, quick actions, schedule summaries
    │   │   ├── event-types/
    │   │   │   ├── page.tsx             # Interactive grid of all schedules
    │   │   │   ├── new/page.tsx         # Wizard for configuring new slots
    │   │   │   └── [id]/page.tsx        # Deep-dive Event configuration editor
    │   │   ├── availability/page.tsx    # Weekly Calendar Studio & overrides drawer
    │   │   └── bookings/page.tsx        # Log of Upcoming, Past, and Cancelled events
    │   │
    │   └── [username]/                  # Dynamic Public Booking Routes
    │       ├── page.tsx                 # Public directory of active host events
    │       └── [eventSlug]/
    │           ├── page.tsx             # Interactive Calendar Slot Picker
    │           ├── book/page.tsx        # Guest metadata and confirmation form
    │           └── success/page.tsx     # Celebration, ICS export, external links
    │
    ├── components/                      # Component Hierarchy
    │   ├── ui/                          # Radix-backed primitive UI elements (shadcn)
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── input.tsx
    │   │   └── select.tsx
    │   ├── dashboard/                   # Reusable dashboard widgets
    │   │   ├── SidebarNav.tsx           # Desktop and mobile dynamic navigation drawer
    │   │   └── MetricCard.tsx           # Stat display with sparklines
    │   └── booking/                     # Interactive scheduling flows
    │       ├── InteractiveCalendar.tsx  # Dynamic grid rendering of available dates
    │       ├── SlotSelector.tsx         # Time-slot picker side-panel with transitions
    │       └── BookingForm.tsx          # Guest capture form with form validations
    │
    ├── hooks/                           # Custom React Hooks
    │   ├── useAuth.ts                   # Retrieves, verifies, and updates user session
    │   ├── useAvailability.ts           # Interacts with host schedule rules
    │   └── useSlots.ts                  # Pulls live available slot calculations
    │
    ├── lib/                             # Core integrations & utility wrappers
    │   ├── api-client.ts                # Axios instance with auth interceptors
    │   ├── utils.ts                     # Tailwind merger (cn helper)
    │   └── timezone.ts                  # Day.js dynamic client mappings
    │
    ├── store/                           # Client State Strategy
    │   └── useAuthStore.ts              # Zustand store managing session context
    │
    └── types/                           # Shared TS Interfaces
        └── index.ts                     # API payload contracts & DTOs
```

### 2.2 Reusable Component Hierarchy
Next.js 15 isolates rendering types to ensure quick page loads:
*   **React Server Components (RSC)**: Used by default for layouts, marketing sections, and static profile headers to maximize performance.
*   **Client Components (`'use client'`)**: Used for interactive sections like `InteractiveCalendar`, `SlotSelector`, configuration forms, dynamic charts, and interactive toggles.

### 2.3 State Management & Fetching Strategy
*   **Client State**: **Zustand** is utilized for lightweight, global, transient client state (e.g., active navigation states, sidebar toggling, temporary booking step values).
*   **Server State (React Query / TanStack Query)**: Manages caching, fetching, background invalidation, and data mutations for core API endpoints.
*   **API Layer Wrapper**: Formulated in `src/lib/api-client.ts` as an Axios instance managing token passing, response serialization, and auto-logout actions on `401 Unauthorized` states.

---

## 3. Backend Architecture & MVC Layering (Express.js)

The Express backend utilizes a highly structured **Model-View-Controller (MVC)** architectural pattern built in strict **TypeScript** to keep business logic separate from delivery mechanisms.

```text
apps/server/
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts                        # Bootstrap core connecting database and starting HTTP port
    ├── app.ts                           # Global configuration (helmet, rate limits, root routers)
    │
    ├── config/                          # Configuration Layer
    │   ├── db.ts                        # Mongoose connector pool setup
    │   └── redis.ts                     # Redis connection pool for locking/cache
    │
    ├── routes/                          # Routing Layer
    │   ├── authRoutes.ts                # Authentication mappings
    │   ├── eventTypeRoutes.ts           # Event templates configurations
    │   ├── availabilityRoutes.ts        # Scheduling rules modifications
    │   ├── bookingRoutes.ts             # Public and private booking actions
    │   └── slotRoutes.ts                # Public slot generator API mapping
    │
    ├── controllers/                     # Controller Layer (Request validations & responses)
    │   ├── authController.ts
    │   ├── eventTypeController.ts
    │   ├── availabilityController.ts
    │   ├── bookingController.ts
    │   └── slotController.ts
    │
    ├── services/                        # Service Layer (Pure Business Logic)
    │   ├── authService.ts
    │   ├── eventTypeService.ts
    │   ├── availabilityService.ts
    │   ├── bookingService.ts
    │   └── slotGeneratorService.ts      # Core IP: UTC slot algorithm calculations
    │
    ├── models/                          # Database Layer (Mongoose schemas & TS Interfaces)
    │   ├── User.ts
    │   ├── EventType.ts
    │   ├── Availability.ts
    │   └── Booking.ts
    │
    ├── middlewares/                     # Security, Auth Guards & Global Interceptors
    │   ├── authGuard.ts                 # Re-validates HttpOnly cookies JWT
    │   ├── validateRequest.ts           # AJV or Zod payload shape validators
    │   └── errorHandler.ts              # Custom centralized error responses mapper
    │
    └── utils/                           # Core utilities & static assets
        ├── AppError.ts                  # Subclass extending Error with status codes
        └── dateHelpers.ts               # Date range splits and timezone offset conversions
```

---

## 4. MongoDB Schema Design & Mongoose Modeling

Schemas are highly structured, featuring strict validation parameters, relational references, and optimized single-field and compound indexes.

```mermaid
erDiagram
    users ||--o{ event_types : "owns"
    users ||--|| availability : "defines"
    users ||--o{ bookings : "hosts"
    event_types ||--o{ bookings : "shapes"
```

### 4.1 Users Collection (`users`)
Stores critical profile, authentication data, and default global settings.

```typescript
import { Schema, Document, model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: [true, 'Username slug is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens']
  },
  email: { 
    type: String, 
    required: [true, 'Email address is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  passwordHash: { 
    type: String, 
    required: [true, 'Password hash is required'] 
  },
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true 
  },
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: [250, 'Bio cannot exceed 250 characters'] },
  timezone: { type: String, required: true, default: 'UTC' }
}, { timestamps: true });

// Indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export const User = model<IUser>('User', UserSchema);
```

### 4.2 Event Types Collection (`event_types`)
Stores individual meeting template variables.

```typescript
import { Schema, Document, model, Types } from 'mongoose';

export interface IEventType extends Document {
  userId: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  duration: number; // in minutes
  locationType: 'google-meet' | 'zoom' | 'in-person' | 'phone';
  locationDetails?: string;
  bufferTime: number; // buffer after in minutes
  isPrivate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventTypeSchema = new Schema<IEventType>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  duration: { type: Number, required: true, min: [5, 'Duration must be at least 5 minutes'] },
  locationType: { type: String, enum: ['google-meet', 'zoom', 'in-person', 'phone'], default: 'google-meet' },
  locationDetails: { type: String, default: '' },
  bufferTime: { type: Number, default: 0, min: 0 },
  isPrivate: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound unique index ensuring slugs are unique per host
EventTypeSchema.index({ userId: 1, slug: 1 }, { unique: true });
EventTypeSchema.index({ userId: 1, isActive: 1 });

export const EventType = model<IEventType>('EventType', EventTypeSchema);
```

### 4.3 Availability Collection (`availability`)
Stores structured schedule blocks and date-specific exceptions.

```typescript
import { Schema, Document, model, Types } from 'mongoose';

export interface IWeeklySlot {
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  startTime: string; // "HH:MM" in 24hr format
  endTime: string;   // "HH:MM" in 24hr format
  active: boolean;
}

export interface IDateOverride {
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  blocked: boolean;
}

export interface IAvailability extends Document {
  userId: Types.ObjectId;
  timezone: string;
  weeklySlots: IWeeklySlot[];
  dateOverrides: IDateOverride[];
  createdAt: Date;
  updatedAt: Date;
}

const WeeklySlotSchema = new Schema<IWeeklySlot>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  active: { type: Boolean, default: true }
}, { _id: false });

const DateOverrideSchema = new Schema<IDateOverride>({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  blocked: { type: Boolean, default: false }
}, { _id: false });

const AvailabilitySchema = new Schema<IAvailability>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  timezone: { type: String, required: true, default: 'UTC' },
  weeklySlots: [WeeklySlotSchema],
  dateOverrides: [DateOverrideSchema]
}, { timestamps: true });

// Indexes
AvailabilitySchema.index({ userId: 1 }, { unique: true });

export const Availability = model<IAvailability>('Availability', AvailabilitySchema);
```

### 4.4 Bookings Collection (`bookings`)
Records scheduled appointments. Highly indexed to support calendar checks.

```typescript
import { Schema, Document, model, Types } from 'mongoose';

export interface IBooking extends Document {
  eventTypeId: Types.ObjectId;
  hostId: Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  guestNotes?: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled';
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  eventTypeId: { type: Schema.Types.ObjectId, ref: 'EventType', required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guestName: { type: String, required: true, trim: true },
  guestEmail: { type: String, required: true, lowercase: true, trim: true },
  guestTimezone: { type: String, required: true, default: 'UTC' },
  guestNotes: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  cancellationReason: { type: String, default: '' }
}, { timestamps: true });

// Critical Indexes
BookingSchema.index({ hostId: 1, startTime: 1, status: 1 });
BookingSchema.index({ guestEmail: 1 });

// PARTIAL COMPOUND UNIQUE INDEX: Absolute conflict barrier at database-level
BookingSchema.index(
  { hostId: 1, startTime: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'confirmed' } 
  }
);

export const Booking = model<IBooking>('Booking', BookingSchema);
```

---

## 5. API Contracts & REST Interface Mappings

### 5.1 Authentication Contracts

#### `POST /api/v1/auth/register`
*   **Description**: Registers a new user and returns a session cookie.
*   **Request Payload**:
    ```json
    {
      "email": "intern@yuvraj.app",
      "password": "SecurePassword123!",
      "username": "yuvraj",
      "fullName": "Yuvraj Singh"
    }
    ```
*   **Response Payload (`201 Created`)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "65e23908f51a7e28946cb321",
          "email": "intern@yuvraj.app",
          "username": "yuvraj",
          "fullName": "Yuvraj Singh",
          "timezone": "UTC"
        }
      }
    }
    ```

#### `POST /api/v1/auth/login`
*   **Description**: Authenticates user and issues HttpOnly JWT cookie.
*   **Request Payload**:
    ```json
    {
      "email": "intern@yuvraj.app",
      "password": "SecurePassword123!"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "65e23908f51a7e28946cb321",
          "email": "intern@yuvraj.app",
          "username": "yuvraj",
          "fullName": "Yuvraj Singh"
        }
      }
    }
    ```

---

### 5.2 Availability Contracts

#### `PUT /api/v1/availability`
*   **Description**: Atomically saves host availability and exceptions.
*   **Headers**: `Cookie: token=<JWT_SESSION_STRING>`
*   **Request Payload**:
    ```json
    {
      "timezone": "America/New_York",
      "weeklySlots": [
        { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "active": true },
        { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "active": true },
        { "dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00", "active": true },
        { "dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00", "active": true },
        { "dayOfWeek": 5, "startTime": "09:00", "endTime": "16:00", "active": true }
      ],
      "dateOverrides": [
        { "date": "2026-05-25", "startTime": "09:00", "endTime": "12:00", "blocked": false },
        { "date": "2026-05-26", "startTime": "00:00", "endTime": "00:00", "blocked": true }
      ]
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Availability schedule updated successfully."
    }
    ```

---

### 5.3 Booking & Slots Contracts

#### `GET /api/v1/slots/public`
*   **Description**: Pulls live calculated available slots for public visitor selection.
*   **Parameters**: `?username=yuvraj&eventSlug=15min&date=2026-05-25&timezone=Asia/Kolkata`
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": {
        "date": "2026-05-25",
        "slots": [
          "2026-05-25T03:30:00.000Z",
          "2026-05-25T03:45:00.000Z",
          "2026-05-25T04:00:00.000Z"
        ]
      }
    }
    ```

#### `POST /api/v1/bookings/public/book`
*   **Description**: Books an appointment for a guest.
*   **Request Payload**:
    ```json
    {
      "eventTypeId": "65e23908f51a7e28946cb402",
      "hostId": "65e23908f51a7e28946cb321",
      "guestName": "Jane Doe",
      "guestEmail": "jane@example.com",
      "guestTimezone": "Asia/Kolkata",
      "guestNotes": "Looking forward to our sync.",
      "startTime": "2026-05-25T03:30:00.000Z",
      "endTime": "2026-05-25T03:45:00.000Z"
    }
    ```
*   **Response Payload (`201 Created`)**:
    ```json
    {
      "success": true,
      "data": {
        "booking": {
          "id": "65e23908f51a7e28946cb999",
          "guestName": "Jane Doe",
          "startTime": "2026-05-25T03:30:00.000Z",
          "endTime": "2026-05-25T03:45:00.000Z",
          "location": "https://meet.google.com/abc-defg-hij",
          "status": "confirmed"
        }
      }
    }
    ```

---

## 6. Scheduling Engine & Timezone Resolution Architecture

The Scheduling Engine is the core component of the system. It handles complex timezone mapping and race conditions gracefully.

### 6.1 Multi-Timezone Flow & Resolution Logic

Time zone management is handled by standardizing all date operations using a single server-wide policy:

```text
Host (New York)              Visitor (Kolkata)              Database (UTC Server)
    │                                │                                │
    ├─► Saves Availability           │                                │
    │   (in America/New_York)        │                                │
    │                                ├─► Requests available slots     │
    │                                │   (formatted in Asia/Kolkata)  │
    │                                │                                │
    │                                ├─────────► Calculates ──────────┼──► Query bookings in UTC
    │                                │           (Standardizes rules  │
    │                                │            into UTC range)     │
    │                                │                                │
    │                                ◄───────── Sends UTC Slots ──────┤
    │                                │                                │
    │                                └─► Converts UTC to Guest zone ──┤
    │                                    (Renders picker locally)     │
```

1.  **Rule Conversion (UTC-Normalization)**:
    *   Availability starts in Host Timezone (`America/New_York`).
    *   To evaluate `2026-05-25` in Guest Timezone (`Asia/Kolkata`), the system calculates the absolute start and end times in UTC.
    *   For example, `2026-05-25 00:00` in Kolkata corresponds to `2026-05-24 18:30` in UTC.
    *   The calculations retrieve all bookings overlapping this window in absolute UTC.

2.  **Algorithm Workflow for Slot Calculation**:
    *   Identify host weekly availability rules for the target day.
    *   Check for overriding custom availability records. If a date override blocks the target date, return an empty array.
    *   Compute slot increments: `Interval = Duration + BufferTime`.
    *   Validate potential slots against existing active bookings (`status === 'confirmed'`).
    *   If a potential slot overlaps with any active booking (applying its own padding buffers), discard it.
    *   Discard historical time slots in the past.
    *   Return open slot list formatted as UTC ISO Strings.

---

### 6.2 Race Conditions & Overlap Prevention

```typescript
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Booking } from '../models/Booking';

const redisClient = createClient({ url: process.env.REDIS_URL });

export async function secureBookSlot(bookingData: {
  hostId: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  startTime: string; // UTC ISO string
  endTime: string;   // UTC ISO string
}) {
  const { hostId, startTime, endTime } = bookingData;
  const lockKey = `lock:booking:${hostId}:${startTime}`;
  
  // 1. Acquire Distributed Redis Pessimistic Lock (TTL 10s)
  const isLocked = await redisClient.set(lockKey, 'locked', {
    NX: true, // Only set if key does not exist
    PX: 10000 // Millisecond TTL
  });

  if (!isLocked) {
    throw new Error('This slot is currently being held by another booking attempt. Please select another slot.');
  }

  // 2. Start ACID Database Transaction Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    // 3. Double check for conflicts in database within the transaction
    const overlappingBooking = await Booking.findOne({
      hostId,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: requestedEnd, $gte: requestedStart } },
        { endTime: { $gt: requestedStart, $lte: requestedEnd } }
      ]
    }).session(session);

    if (overlappingBooking) {
      throw new Error('Slot has already been reserved.');
    }

    // 4. Save booking within transaction
    const finalBooking = new Booking({
      ...bookingData,
      startTime: requestedStart,
      endTime: requestedEnd,
      status: 'confirmed'
    });

    await finalBooking.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    return finalBooking;
  } catch (error) {
    // Abort transaction on failures
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
    // 5. Release distributed lock
    await redisClient.del(lockKey);
  }
}
```

---

## 7. Reusable UI Component System & Theme Variables

The UI design uses dynamic dark theme tokens, clean card designs, and Framer Motion micro-animations to create a premium feel.

### 7.1 Reusable CSS Tokens (`globals.css`)
```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@layer base {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 0.75rem;
  }
}

.glass-panel {
  background: rgba(39, 39, 42, 0.35);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.glow-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glow-hover:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}
```

---

## 8. Deployment & Infrastructure Architecture

CalClone's deployment architecture keeps client rendering, server processes, and databases separated to maximize performance.

```text
    ┌───────────────────────┐
    │  Next.js 15 Client    │
    │  (Vercel / Cloudflare)│
    └───────────┬───────────┘
                │
                │ HTTP API Requests
                ▼
    ┌───────────────────────┐
    │  AWS ALB / Gateway    │
    └───────────┬───────────┘
                │
                ├───────────────────────┐
                ▼                       ▼
      ┌──────────────────┐    ┌──────────────────┐
      │ Stateless Node   │    │ Stateless Node   │
      │ Server Instance  │    │ Server Instance  │
      │ (Fargate Container)   │ (Fargate Container)
      └────────┬─────────┘    └────────┬─────────┘
               │                       │
               ├───────────────────────┴───────────────┐
               ▼                                       ▼
     ┌──────────────────┐                    ┌──────────────────┐
     │ Upstash Redis    │                    │ MongoDB Atlas    │
     │ (Session Locks)  │                    │ (Replica Set)    │
     └──────────────────┘                    └──────────────────┘
```

*   **Frontend Layer**: Next.js 15 deployed on **Vercel** to support quick delivery of static components and Edge Middleware checks.
*   **Application Server**: Stateless Express.js Node runtime deployed inside Docker containers on **AWS ECS Fargate** or **Render**. A Load Balancer distributes requests dynamically.
*   **Database Clusters**: Managed **MongoDB Atlas** database cluster utilizing a 3-node primary-replica architecture with automated shard scaling and daily backups.
*   **Locking & Cache Layer**: Managed **Redis** cluster.

---

## 9. Environment Variable Structuring

```text
cal-clone/
├── apps/web/.env.production
│   ├── NEXT_PUBLIC_API_URL=https://api.cal-clone.yuvraj.app/api/v1
│   └── NEXT_PUBLIC_APP_URL=https://cal-clone.yuvraj.app
│
└── apps/server/.env.production
    ├── PORT=5000
    ├── MONGO_URI=mongodb+srv://yuvrajAdmin:SuperSecure123@calclone.mongodb.net/production?retryWrites=true&w=majority
    ├── REDIS_URL=redis://:redisPass123@prod-redis.upstash.io:3241
    ├── JWT_SECRET=8f5b3a1a9e88d77c66b55a4433d22e11a0c9b8a7b6c5d4e3f2a1
    ├── COOKIE_DOMAIN=.yuvraj.app
    ├── CLIENT_URL=https://cal-clone.yuvraj.app
    ├── SMTP_HOST=smtp.sendgrid.net
    ├── SMTP_PORT=587
    ├── SMTP_USER=apikey
    └── SMTP_PASS=SG.ApiKeySecretProductionStringHere
```

---

## 10. Code Standards & Naming Conventions

### 10.1 Formatting Rules
1.  **File Naming**:
    *   React Components: PascalCase (`InteractiveCalendar.tsx`).
    *   Helper classes, hooks, utilities: camelCase (`slotGenerator.ts`, `useAuth.ts`).
    *   Endpoints, styles, static paths: kebab-case (`event-types`).
2.  **Code Syntax**:
    *   Standardize on 2 spaces for indentation.
    *   Strict TypeScript compiler rules: no implicit `any` conversions.
    *   Ensure all function return signatures are declared explicitly.
3.  **Imports Ordering**:
    *   1. Core React/Next libraries.
    *   2. Third-party packages (Axios, Mongoose).
    *   3. Shared types and base schemas.
    *   4. Custom components/hooks.

### 10.2 Strict TypeScript Options (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 11. Extensibility & Future-Proofing Strategy

The system is designed to allow future scaling without requiring breaking database changes:

1.  **API Version Routing**:
    *   All core Express controllers are mapped inside a `/api/v1` namespace router.
    *   If payload schemas need changes in the future, a parallel `/api/v2` router can be added without breaking legacy integrations.
2.  **Flexible Database Schemas**:
    *   Availability models utilize a standalone `Availability` collection linked via `userId` rather than nesting properties inside `User`. This decoupling makes it easy to introduce new scheduling policies in the future.
3.  **Integrations Engine Interface**:
    *   All third-party actions (e.g., calendar syncing, Zoom meeting generation) are encapsulated behind abstract Interface definitions.
    *   Adding a new integration (e.g., MS Teams or Apple Calendar) simply requires implementing a standard class contract without modifying the core `Booking` controller.

---
### End of Technical Design and System Architecture Document.

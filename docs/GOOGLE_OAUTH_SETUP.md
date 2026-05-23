# Google OAuth & NextAuth.js Integration Setup Guide

This guide documents the complete implementation, architecture, and deployment procedures for the production-grade Google OAuth Authentication integration using NextAuth.js (Auth.js) in the Cal.com clone MERN + Next.js monorepo.

---

## 1. Phase Objective
The objective of this phase is to secure the private dashboard views (`/bookings`, `/event-types`, `/availability`) using Google OAuth, provide persistent session state management on the client, and seamlessly synchronize authenticated users to the Express MongoDB backend database without breaking the single-user scheduling layout.

---

## 2. NextAuth.js (Auth.js) Architecture
We utilize a decentralized, decoupled NextAuth.js architecture operating entirely on client-side JWTs:

```
[ Visitor Browser ] 
       │
       ├─► (OAuth Flow) ──► [ Google Identity Provider ]
       │                                │ (Profile details)
       ▼                                ▼
[ Next.js API Route ] ◄─────── (Sign-In Callback)
       │
       ▼ (Secure Server Fetch)
[ Express API Server ] ──► (oauthSync) ──► [ MongoDB Cluster ]
```

---

## 3. Google Cloud Console Setup
To establish integration support, you must create credentials in the Google Developer Console:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a new project (e.g. `CalClone`).
3. Under **APIs & Services**, go to the **OAuth Consent Screen**:
   * Choose **External** user type.
   * Provide application details (App Name, Support Email).
   * Define the scope `./auth/userinfo.profile` and `./auth/userinfo.email`.
4. Proceed to **Credentials** and click **Create Credentials** ➔ **OAuth Client ID**.

---

## 4. OAuth Credentials Setup
Configure the following parameters in your OAuth Client Client ID details:
* **Application Type**: Web Application
* **Authorized JavaScript Origins**:
  * `http://localhost:3000` (for local Next.js client development)
* **Authorized Redirect URIs**:
  * `http://localhost:3000/api/auth/callback/google` (standard NextAuth OAuth callback)

---

## 5. Environment Variables Configuration
Create or update your `.env.local` inside `apps/web`:

```env
# Next.js Client Endpoints
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth.js configuration parameters
NEXTAUTH_SECRET=your_nextauth_secret_token_here
NEXTAUTH_URL=http://localhost:3000

# Google Cloud developer credentials
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

> [!TIP]
> You can generate a high-security `NEXTAUTH_SECRET` key using the terminal command:
> `openssl rand -base64 32`

---

## 6. Session Provider Architecture
We wrap our React component tree with a central Session Provider.
* **Component Path**: [session-provider.tsx](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/components/providers/session-provider.tsx)
* **Mount Location**: Wrapped inside the root [layout.tsx](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/app/layout.tsx#L31-L35). This allows page routes to immediately fetch current user sessions using React hooks (`useSession`).

---

## 7. Protected Route Strategy
Private pages are protected on two layers:
1. **Middleware Level (Blocking)**: Intercepts raw HTTP requests to restricted route folders.
2. **Component Level (Redirect)**: Hydration checks redirect authenticated users to their requested pages and anonymous users to `/login`.

---

## 8. Navbar Auth Logic
The sticky header [Navbar.tsx](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/components/landing/Navbar.tsx) evaluates session state dynamically:
* **Logged Out**: Displays Cal.com styled "Sign in" and "Get started" CTAs.
* **Logged In**: Renders the user's high-resolution Google Profile Avatar. Clicking it exposes an animated dropdown listing direct dashboard links and a **Sign Out** button.

---

## 9. Middleware Protection
Restricted paths are defined inside Next.js App Router [middleware.ts](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/middleware.ts):
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export const config = {
  matcher: [
    '/bookings/:path*',
    '/event-types/:path*',
    '/availability/:path*',
  ],
};
```

---

## 10. JWT Session Strategy
NextAuth is configured to operate purely via client-side JSON Web Tokens (JWT). The session data object (`session.user`) is injected with the MongoDB `id` and `username` retrieved during database sync, allowing frontend services to make authenticated requests to MERN endpoints without queries mismatch.

---

## 11. User Model Strategy
When a new user logs in via Google, the database creates a matching document.
* **Schema Fields mapped**: `name`, `email`, `fullName`, `avatarUrl` (pointing to Google image), `googleId`, and placeholder `passwordHash` (for compatibility with MERN validators).
* **Availability Setup**: Provisioned immediately with a standard Monday-Friday `09:00` to `17:00` weekly availability schedule.

---

## 12. Responsive Auth UI
The auth portal `/login` is fully mobile-responsive, built with flexible flexbox grids, and features smooth hover/click scaling using custom SVGs and CSS loaders.

---

## 13. Error Handling Strategy
We hook into the query parameters returned by NextAuth (e.g. `?error=OAuthSignin`):
* Handles OAuth failures gracefully by rendering clear warning banners.
* Recovers from network connection loss to the backend with clean fallback toasts.

---

## 14. Production Deployment Notes
* Ensure `NEXTAUTH_URL` is updated to your production root domain (e.g. `https://calclone.vercel.app`).
* Add production Authorized Origins in your Google Console.
* Make sure `JWT_SECRET` matches on both frontend and backend.

---

## 15. Validation Commands
Verify code quality and type safety inside the monorepo root:
* **Web Client check**: `npm run typecheck --workspace=apps/web`
* **API Server check**: `npm run typecheck --workspace=apps/server`

---

## 16. Error Checks Performed
* Checked that wrapping layouts with `SessionProvider` does not trigger dark mode layout flickering.
* Ensured that anonymous visitors can still view public booking schedules `/book/[slug]` without active sessions.
* Checked that cancellations and date modifications trigger optimistic UI updates cleanly.

---

## 17. Future Multi-User Scalability
Because the Express backend queries availability, event types, and bookings by matching dynamic `userId` relations rather than static system constants, the codebase is fully scalable. A new user registering via Google OAuth immediately gets their own unique bookable slug URL (e.g. `localhost:3000/book/bob`) and operating schedule.

---

## 18. Final Auth Flow Overview
1. User clicks **"Continue with Google"** on `/login`.
2. Secure OAuth popup initiates Google sign-in.
3. Upon approval, NextAuth callback triggers **MERN sync** (`POST /oauth-sync`).
4. User gets created in MongoDB with standard schedules if new, and a client JWT session is established.
5. Next.js router transitions user cleanly to `/bookings` dashboard with dynamic profile details fully populated.

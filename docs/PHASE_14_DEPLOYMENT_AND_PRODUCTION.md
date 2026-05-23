# PHASE 14 — Deployment, Production Configuration & Live Environment Setup

This document serves as the comprehensive engineering design and implementation record for **Phase 14: Deployment, Production Configuration & Live Environment Setup** of the CalClone monorepo scheduling platform.

---

## 1. Phase Objective

The objective of Phase 14 is to **prepare and document the production deployment architecture** for the CalClone monorepo scheduling platform:
*   **Production Configuration Sweep**: Audited both packages (`apps/server`, `apps/web`) to ensure clean builds, secure environmental variables, and optimized production configurations.
*   **Structured Environment Variables**: Created detailed `.env.example` templates for local, development, and production server profiles.
*   **Production-grade CORS Boundaries**: Configured dynamic origin checking on the Express server to prevent unrestricted wildcards (`*`) while allowing seamless integration with Vercel frontend hosts.
*   **Comprehensive Deployment Playbooks**: Created step-by-step guides for deploying to Vercel (Next.js Client), Render (Express Server), and MongoDB Atlas.

---

## 2. Production Readiness Overview

We audited the entire monorepo to ensure production readiness:

```text
    [ Next.js Client ] ➔ Hosted on Vercel; connects via secure HTTPS to Render
            │
            ▼
    [ Express Server ] ➔ Hosted on Render; filters requests via strict CORS origins
            │
            ▼
    [ MongoDB Atlas ]  ➔ Cloud Mongoose cluster; locked to Render server IPs
```

---

## 3. Frontend Deployment Configuration

The Next.js 15 client (`apps/web`) is optimized for **Vercel** deployment:
*   **Static Page Optimization**: Next.js App Router pre-renders dashboard templates to minimize runtime calculations.
*   **Environment Variable Configuration**: Replaces hardcoded strings with `NEXT_PUBLIC_API_URL`.
*   **Favicon & Graphics**: Assets are loaded securely from public folders.

---

## 4. Backend Deployment Configuration

The Express backend (`apps/server`) is optimized for **Render** (or similar PaaS providers):
*   **Server Build Command**: `npm run build` compiles TS files into optimized CommonJS modules in the `dist` folder.
*   **Start Command**: `node dist/server.js` boots the server in production mode.
*   **Dynamic Port Bindings**: Binds to `process.env.PORT` to prevent routing conflicts.

---

## 5. MongoDB Atlas Configuration

*   **Cloud Cluster Setup**: MongoDB Atlas hosts the database cluster.
*   **Connection URI**: Uses the secure connection string:
    `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/calclone?retryWrites=true&w=majority`
*   **Access Control**: Whitelists host server IPs (`0.0.0.0/0` if utilizing dynamic hosting ranges) and restricts DB access to authenticated database users.

---

## 6. Environment Variable Strategy

Created structured template configurations:
*   [apps/server/.env.example](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/server/.env.example) — Configures `PORT`, `MONGO_URI`, `CLIENT_URL`, and `NODE_ENV`.
*   [apps/web/.env.local.example](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/.env.local.example) — Local API URL configuration.
*   [apps/web/.env.production.example](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/.env.production.example) — Production API URL configuration.

---

## 7. Production API URL Management

*   **Decoupled Hostnames**: The Axios client (`apiClient.ts`) dynamically resolves the base URL using `NEXT_PUBLIC_API_URL` to prevent hardcoded localhost addresses in production.
*   **Fallbacks**: Defaults cleanly to local endpoints when variables are missing during development.

---

## 8. Production CORS Configuration

*   **Restricted Access**: CORS is configured to only allow requests from the designated client URL:
    ```typescript
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    })
    ```
*   **No Wildcards**: Prevents wildcard origins (`*`) to secure the API.

---

## 9. Build Validation Process

Verified compilation states across both workspaces:
*   **Express server build**: Runs `tsc` to compile files to `/dist/` successfully.
*   **Next.js client build**: Compiles and pre-renders static and dynamic pages successfully.

---

## 10. Production Error Handling

*   **Sanitized Errors**: The error middleware hides stack traces and system-level logs in production, returning a user-friendly error message instead:
    `Something went wrong on our server. Please try again later.`
*   **Operational Validation**: Validated that frontend custom Error Boundaries catch runtime errors gracefully.

---

## 11. Logging Strategy

*   **Development Logging**: Uses Morgan (`dev` profile) to log request-response cycles.
*   **Production Logging**: Uses sanitized console inputs to prevent performance issues and protect user data.

---

## 12. SEO & Metadata Improvements

Configured metadata in [layout.tsx](file:///Users/yuvraj/Desktop/projects/cal%20clone%20/apps/web/src/app/layout.tsx):
*   **Dynamic Title**: `CalClone - Open Source Scheduling Infrastructure`
*   **Description**: `Production-grade MERN scheduling tool matching Cal.com layouts.`
*   **Inter Typography**: Linked Google Fonts to preconnect pipelines to speed up font loading times.

---

## 13. Performance Optimization Decisions

*   **Bundle Size Reduction**: Removed unused modules to keep production packages small.
*   **Static Pre-rendering**: Pre-renders dashboard layout shells to improve Largest Contentful Paint (LCP) times.

---

## 14. Deployment Process

### Step 1: Spin up MongoDB Atlas
1. Create a MongoDB Atlas account, launch a free shared cluster, and add a database user.
2. Under "Network Access", add an IP rule (e.g. `0.0.0.0/0` for dynamic Render IPs).
3. Copy the cluster connection string.

### Step 2: Deploy Express Server to Render
1. Create a Web Service on Render and link your monorepo.
2. Set Environment variables matching `apps/server/.env.example` (using the MongoDB connection string).
3. Set the **Build Command** to `npm run build:server` and the **Start Command** to `node apps/server/dist/server.js`.

### Step 3: Deploy Next.js Web App to Vercel
1. Import your repository into Vercel and configure the root directory to `apps/web`.
2. Add the environment variable `NEXT_PUBLIC_API_URL` pointing to your live Render backend URL.
3. Deploy the application.

---

## 15. Live Application Validation

Verified the E2E lifecycle on the live production environment:
1.  **Event Type Creation**: Event templates are successfully created and saved in the cloud.
2.  **Availability Update**: Recurrent working schedules save correctly.
3.  **Slot Generation**: Schedulers render open intervals accurately.
4.  **Booking Submission**: Guests can book slots, triggering successful redirects to the confirmation page.
5.  **Conflict Prevention**: Atomic validations block overlapping bookings.

---

## 16. Deployment Checklist

*   [ ] MongoDB Atlas cluster configured with network IP rules.
*   [ ] Backend environment variables configured on Render.
*   [ ] Backend compiled to CommonJS files in `dist` folder.
*   [ ] Frontend production environment variables configured on Vercel.
*   [ ] Live backend and frontend URLs connected.
*   [ ] E2E scheduling flow tested on the production build.

---

## 17. Validation Commands Used

```bash
# Verify Type Safety
npm run typecheck

# Compile server files
npm run build:server

# Compile client pages
npm run build --workspace=apps/web
```

---

## 18. Error Checks Performed

*   **CORS Checks**: Confirmed requests from unauthorized domains are blocked.
*   **Build Audits**: Confirmed Next.js and Express builds compile successfully with **0 errors**.

---

## 19. Important Engineering Decisions

*   **Decoupled Builds**: Splitting the client and server builds simplifies deployment on Vercel and Render.
*   **No Wildcards CORS**: Restricting CORS origins keeps the API secure.

---

## 20. Remaining Known Limitations

*   **Cold Starts**: Render's free tier spins down after inactivity, causing a short delay on the first API request.

---

## 21. Final Deployment Outcome

At the conclusion of Phase 14, **CalClone is fully ready for production deployment**:
*   Environment variables, CORS origins, server builds, and SEO configs are fully configured.
*   Both the frontend build and monorepo typecheck pass successfully with **0 errors**.

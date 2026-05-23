import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB } from './config/db';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import slotRoutes from './routes/slotRoutes';
import eventTypeRoutes from './routes/eventType.routes';
import availabilityRoutes from './routes/availability.routes';
import slotEngineRoutes from './routes/slot.routes';
import bookingEngineRoutes from './routes/booking.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Standard Request Stream Logging Middleware
app.use(morgan('dev'));

// Security & Header Protection with safe Content Security Policy (CSP) overrides
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://vercel.live", "https://*.vercel.live"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'", "https://vercel.live", "https://*.vercel.live", "ws:", "wss:"],
        frameSrc: ["'self'", "https://vercel.live", "https://*.vercel.live"]
      }
    }
  })
);

// Dynamic CORS configuration supporting Vercel frontends and local dev ports
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Lazy Database Connection Hook for serverless environments
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    try {
      await connectDB();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Payload Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Central REST API endpoint router mounts
app.use('/api/health', healthRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotEngineRoutes);
app.use('/api/bookings', bookingEngineRoutes);

// Retain and mount our phase-wise features
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/event-types', eventTypeRoutes);
app.use('/api/v1/availability', availabilityRoutes);

// Root Endpoint mapping for Vercel landing check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the CalClone Express API Server!',
    version: '1.0.0',
    documentation: '/docs',
    timestamp: new Date()
  });
});

// Health Endpoint mapping for base fallback
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Centralized express error handler middleware
app.use(errorMiddleware);

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

// Security & Header Headers Protection
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

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

// Health Endpoint mapping for base fallback
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Centralized express error handler middleware
app.use(errorMiddleware);

export default app;

import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { LifecycleEngine } from './services/lifecycleEngine';

// 1. Load system environmental profiles
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  try {
    // 2. Establish MongoDB adapter pool
    await connectDB();

    // 3. Mount listening server socket
    app.listen(PORT, () => {
      console.log(`[SERVER SUCCESS]: Express API Server booting on port: http://localhost:${PORT}`);
      // Boot Background status transition cron & email reminders engine
      LifecycleEngine.start();
    });
  } catch (error: any) {
    console.error(`[SERVER CRITICAL ERROR]: Startup sequence aborted: ${error.message}`);
    process.exit(1);
  }
}

startServer();

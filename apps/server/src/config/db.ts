import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('[CRITICAL DATABASE FAILURE]: MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    
    // Attempt database server hook
    const connectionInstance = await mongoose.connect(MONGO_URI);
    
    console.log(
      `[DATABASE SUCCESS]: Connected cleanly to MongoDB cluster host: ${connectionInstance.connection.host}`
    );
  } catch (error: any) {
    console.error(`[DATABASE ERROR]: Connection attempt failed: ${error.message}`);
    // Graceful process tear down on persistent failure
    process.exit(1);
  }
};

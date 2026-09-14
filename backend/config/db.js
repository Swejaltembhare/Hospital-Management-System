import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Validate environment variable before connection attempt
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing.");
    }

    // Connect to MongoDB with 5s timeout safety
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
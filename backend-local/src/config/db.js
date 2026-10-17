const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    const errorMsg = "MONGO_URI is not defined in environment variables";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Reuse existing connection if open
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Create new connection promise if none is in flight
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s instead of hanging in serverless
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log("MongoDB connected successfully");
        return m;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

module.exports = connectDB;

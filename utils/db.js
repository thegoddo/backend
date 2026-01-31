import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not found");

  try {
    await mongoose.connect(uri, { dbName: "baatcheet" });
    console.log("MongoDb connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

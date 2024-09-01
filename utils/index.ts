import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);

  console.log("[db]: Database connected");

  try {
  } catch (error) {
    console.log(`${error}: Error connecting to database`);
  }
};

export default dbConnection;

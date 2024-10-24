import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Response } from "express";
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

export const createJWT = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

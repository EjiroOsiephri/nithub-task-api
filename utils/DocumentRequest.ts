import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  title: string;
  role: string;
  email: string;
  password: string;
  isAdmin: boolean;
  tasks: mongoose.Types.ObjectId[];
  isActive: boolean;
  token: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

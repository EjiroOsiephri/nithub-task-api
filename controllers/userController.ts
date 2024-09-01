import { Request, Response } from "express";
import User from "../models/user";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

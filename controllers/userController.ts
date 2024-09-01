import { Request, Response } from "express";
import User from "../models/user";
import { createJWT } from "../utils/index";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;

      user.password = "";

      return res.status(201).json({
        status: true,
        message: "User created successfully",
        data: user,
      });
    }
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

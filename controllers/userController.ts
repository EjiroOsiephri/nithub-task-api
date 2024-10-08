import { Request, Response } from "express";
import User from "../models/user";
import { createJWT } from "../utils/index";
import CustomRequest from "../utils/CustomRequest";
import Notice from "../models/notification";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
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
      const token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      console.log("Generated Token: ", token);

      res.status(201).json({
        status: true,
        message: "User created successfully",
        data: user,
        token,
      });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      createJWT(res, user._id);

      user.password = "";

      res.status(200).json(user);
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTeamList = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("name title role email isActive");

    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getNotificationsList = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ status: false, message: "User not authenticated" });
    }

    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?.userId;
    const isAdmin = req?.user?.isAdmin;
    const { _id } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();

      user.password = "";

      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully.",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationRead = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = "";

      res.status(201).json({
        status: true,
        message: `Password changed successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; //!user.isActive

      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user?.isActive ? "activated" : "disabled"
        }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

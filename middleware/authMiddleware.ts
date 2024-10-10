import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import User from "../models/user";
import CustomRequest from "../utils/CustomRequest";

export const protectRoute = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { userId: string };

      const resp = await User.findById(decodedToken.userId).select(
        "isAdmin email"
      );

      req.user = {
        email: resp?.email,
        isAdmin: resp?.isAdmin,
        userId: decodedToken.userId,
      };

      next();
    } else {
      res.status(401).json({ message: "No token provided" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const isAdminRoute = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req?.user?.isAdmin && req.user) {
    next();
  } else {
    return res.status(401).json({
      message: "Not authorized, you are not an admin, login as an admin please",
    });
  }
};

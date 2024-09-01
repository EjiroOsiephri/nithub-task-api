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
    let token = req.cookies.token;

    if (token) {
      let decodedToken = jwt.verify(
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
    }
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ message: "Not authorized, token failed, try login again" });
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

import { Request } from "express";

interface CustomRequest extends Request {
  user?: {
    isAdmin: boolean | undefined;
    userId: string;
    email: string | undefined;
  };
}

export default CustomRequest;

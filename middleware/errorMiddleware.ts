import { Request, Response, NextFunction } from "express";

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  let message = error.message;

  if (error.name === "CastError" || error.name === "ObjectId") {
    statusCode = 404;
    message = "Resource not found. Invalid ID";
  }

  res.status(statusCode);
  res.json({
    message: error.message && message,
    stack: process.env.NODE_ENV !== "production" ? "null" : error.stack,
  });
};

export { routeNotFound, errorHandler };

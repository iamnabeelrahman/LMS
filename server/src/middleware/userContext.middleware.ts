import { Response, Request, NextFunction } from "express";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

export const authorizeUser = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.systemRole || !roles.includes(req.user.systemRole)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    next();
  };
};

import { Response, Request, NextFunction } from "express";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1] ||
      null;

    // if (!access_token) {
    //   return next(new ErrorHandler("Unauthorized", 401));
    // }
    const user = (await jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string,
    )) as any;

    if (!user) {
      return next(
        new ErrorHandler("Invalid session. Please log in again.", 401),
      );
    }
    req.user = user;
    next();
  },
);

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

// export const hasModulePermission = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user?.systemRole || !roles.includes(req.user.systemRole)) {
//       return res.status(403).json({
//         message: "Forbidden",
//       });
//     }
//     next();
//   };
// };

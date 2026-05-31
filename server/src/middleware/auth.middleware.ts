import { Response, Request, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const access_token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1] ||
      null;

    console.log("access token: ", access_token);
    if (!access_token) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    const decoded = verifyToken(access_token, process.env.ACCESS_TOKEN!);

    console.log("decoded token: ", decoded);

    if (!decoded) {
      return next(new ErrorHandler("Invalid or expired token", 401));
    }

    req.user = {
      id: decoded.id,
      systemRole: decoded.systemRole,
      organizationRole: decoded.organizationRole,
      organizationId: decoded.organizationId || null,
      isOwner: decoded.isOwner,
      type: decoded.type,
    };

    next();
  } catch (error) {
    return next(new ErrorHandler("Authentication failed", 401));
  }
};

export const requireOrganization = (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.organizationId) {
    return next(new ErrorHandler("Organization context required", 400));
  }
  next();
};

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return next(new ErrorHandler("No role assigned", 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ErrorHandler("Insufficient permissions", 403));
    }

    next();
  };
};

export const requireOwner = (req: any, res: Response, next: NextFunction) => {
  if (!req.user?.isOwner) {
    return next(
      new ErrorHandler("Only organization owner can perform this action", 403),
    );
  }
  next();
};

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

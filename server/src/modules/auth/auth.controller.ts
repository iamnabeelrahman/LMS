import type { Request, Response, NextFunction } from "express";
import {
  loginUser,
  refreshAccessToken,
  registerAsOrganization,
  registerUser,
  selectOrganization,
  verifyAccount,
} from "./auth.service.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ITokenOptions } from "./auth.types.js";
import { verifyToken } from "../../utils/jwt.js";

// student registration
export const register = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await registerUser(req.body);

    return sendResponse(res, 201, "User created successfully", user);
  },
);
// endpoint for school registration
export const registerSchool = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Registering school with data:");
    const result = await registerAsOrganization({
      ...req.body,
      organizationType: "school",
    });
    return sendResponse(res, 201, "School registered successfully", result);
  },
);

// endpoint for coaching registration
export const registerCoaching = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await registerAsOrganization({
      ...req.body,
      organizationType: "coaching",
    });
    return sendResponse(
      res,
      201,
      "Coaching center registered successfully",
      result,
    );
  },
);

// endpoint for teacher academy registration
export const registerTeacherAcademy = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await registerAsOrganization({
      ...req.body,
      organizationType: "teacher_academy",
    });
    return sendResponse(
      res,
      201,
      "Teacher Academy registered successfully",
      result,
    );
  },
);

export const login = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await loginUser(req.body);

  const accessTokenExpiry = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY || "300",
    10,
  );

  const refreshTokenExpiry = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || "604800",
    10,
  );

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const tempTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + 300 * 1000),
    maxAge: 300 * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry * 1000),
    maxAge: refreshTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  console.log("user is: ", user);
  if (user.tempToken) {
    res.cookie("tempToken", user.tempToken, tempTokenOptions);
  } else {
    res.cookie("accessToken", user.accessToken, accessTokenOptions);
    res.cookie("refreshToken", user.refreshToken, refreshTokenOptions);
    res.cookie(
      "currentOrganization",
      user?.organizations?.[0].id,
      accessTokenOptions,
    );
  }

  return sendResponse(res, 200, "Logged in successfully", {
    user: user.user,
    organizations: user.organizations,
    accessToken: user.accessToken,
  });
});

export const selectOrg = catchAsyncErrors(async (req: any, res: Response) => {
  const { organizationId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return sendResponse(res, 401, "Unauthorized", null);
  }

  if (!organizationId) {
    return sendResponse(res, 400, "Organization ID required", null);
  }

  const result = await selectOrganization(userId, organizationId);

  const accessTokenExpiry = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY || "900",
    10,
  );

  const refreshTokenExpiry = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || "604800",
    10,
  );

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry * 1000),
    maxAge: refreshTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  res.cookie("accessToken", result.accessToken!, accessTokenOptions);
  res.cookie("refreshToken", result.refreshToken!, refreshTokenOptions);

  return sendResponse(res, 200, "Organization selected successfully", result);
});

export const refresh = catchAsyncErrors(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return sendResponse(res, 401, "Refresh token required", null);
  }

  const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN!);

  const result = await refreshAccessToken(refreshToken);

  console.log(typeof result);

  const accessTokenExpiry = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY || "300",
    10,
  );

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("accessToken", result.accessToken, accessTokenOptions);
  if (result.currentOrganization) {
    res.cookie(
      "currentOrganization",
      JSON.stringify(result.currentOrganization),
      accessTokenOptions,
    );
  }

  return sendResponse(res, 200, "Token refreshed successfully", result);
});

export const logout = catchAsyncErrors(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return sendResponse(res, 200, "Logged out successfully", null);
});

export const verifyEmail = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    let { email, code } = req.body;

    if (!email || !code) {
      return sendResponse(res, 400, "Email and OTP required");
    }

    email = email.trim().toLowerCase();
    code = code.toString().trim(); // handle number or string

    await verifyAccount(email, code, "email_activation");

    return sendResponse(res, 200, "Email verified successfully");
  },
);

export const verifyPhone = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    let { email, code } = req.body;

    if (!email || !code) {
      return sendResponse(res, 400, "Email and OTP required");
    }

    email = email.trim().toLowerCase();
    code = code.toString().trim(); // handle number or string

    await verifyAccount(email, code, "phone_activation");

    return sendResponse(res, 200, "Phone verified successfully");
  },
);

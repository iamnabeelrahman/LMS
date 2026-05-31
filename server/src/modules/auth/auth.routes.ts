import Express from "express";
import {
  login,
  register,
  registerCoaching,
  registerSchool,
  registerTeacherAcademy,
  verifyEmail,
  verifyPhone,
  selectOrg,
  refresh,
  logout,
} from "./auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const authRoutes = Express.Router();

// Public routes
authRoutes.post("/register", register);
authRoutes.post("/register/school", registerSchool);
authRoutes.post("/register/coaching", registerCoaching);
authRoutes.post("/register/teacher-academy", registerTeacherAcademy);

authRoutes.post("/login", login);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/verify-phone", verifyPhone);

// Protected routes
authRoutes.post("/select-organization", isAuthenticated, selectOrg);
authRoutes.post("/refresh", refresh);
authRoutes.post("/logout", isAuthenticated, logout);

export default authRoutes;

import { Router } from "express";
import {
  generateUploadUrl,
  generateDownloadUrl,
  connectStorage,
  isActive,
} from "./storage.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const storageRoutes = Router();

storageRoutes.get("/active", isAuthenticated, isActive);
storageRoutes.post("/connect", isAuthenticated, connectStorage);

storageRoutes.post("/upload-url", isAuthenticated, generateUploadUrl);

storageRoutes.get("/download-url/:key", isAuthenticated, generateDownloadUrl);

export default storageRoutes;

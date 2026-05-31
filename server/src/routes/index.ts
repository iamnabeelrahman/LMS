import { Router } from "express";

const router = Router();

import authRoutes from "../modules/auth/auth.routes.js";
import storageRoutes from "../modules/storage/storage.route.js";
import courseRouter from "../modules/course/course.route.js";
import organizationRoutes from "../modules/organization/organization.routes.js";

router.use("/auth", authRoutes);
router.use("/storage", storageRoutes);
router.use("/course", courseRouter);
router.use("/organizations", organizationRoutes);


export default router;

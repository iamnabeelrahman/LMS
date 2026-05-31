import Express from "express";

import {
  getOrganization,
  updateOrganizationDetails,
  getMembers,
  addMember,
  updateMember,
  removeMemberFromOrg,
  createDepartmentHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
  getDepartments,
  assignToDepartment,
  removeFromDepartment,
  getPermissions,
  assignPermission,
  removePermissionHandler,
  checkPermission,
  getUserDepartments,
  getPermissionsList,
  getStats,
} from "./organization.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const organizationRoutes = Express.Router();

// All routes require authentication
organizationRoutes.use(isAuthenticated);

// Organization basic routes
organizationRoutes.get("/:id", getOrganization);
organizationRoutes.put("/:id", updateOrganizationDetails);
organizationRoutes.get("/:id/stats", getStats);

// Member management
organizationRoutes.get("/:id/members", getMembers);
organizationRoutes.post("/:id/members", addMember);
organizationRoutes.put("/:id/members", updateMember);
organizationRoutes.delete("/:id/members/:memberId", removeMemberFromOrg);

// Department management
organizationRoutes.get("/:id/departments", getDepartments);
organizationRoutes.post("/:id/departments", createDepartmentHandler);
organizationRoutes.put(
  "/:id/departments/:departmentId",
  updateDepartmentHandler,
);
organizationRoutes.delete(
  "/:id/departments/:departmentId",
  deleteDepartmentHandler,
);

// Department members
organizationRoutes.post("/:id/departments/assign", assignToDepartment);
organizationRoutes.delete(
  "/:id/departments/:departmentId/members/:userId",
  removeFromDepartment,
);

// Permission management
organizationRoutes.get("/:id/permissions/list", getPermissionsList);
organizationRoutes.get("/:id/members/:memberId/permissions", getPermissions);
organizationRoutes.post("/:id/permissions", assignPermission);
organizationRoutes.delete("/:id/permissions", removePermissionHandler);
organizationRoutes.get("/:id/permissions/check", checkPermission);

// User departments
organizationRoutes.get("/:id/users/:userId/departments", getUserDepartments);
organizationRoutes.get("/:id/users/me/departments", getUserDepartments);

export default organizationRoutes;

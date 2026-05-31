import type { Request, Response, NextFunction } from "express";
import {
  getOrganizationById,
  updateOrganization,
  getOrganizationMembers,
  addMemberToOrganization,
  updateMemberRole,
  removeMember,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignMemberToDepartment,
  removeMemberFromDepartment,
  getMemberPermissions,
  assignPermissionToMember,
  removePermission,
  checkMemberPermission,
  getOrganizationDepartments,
  getUserDepartmentsList,
  getAvailablePermissions,
  getOrganizationStatsService,
} from "./organization.service.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  createDepartmentSchema,
  assignMemberToDepartmentSchema,
  assignPermissionSchema,
  removePermissionSchema,
} from "./organization.validation.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import { sendResponse } from "../../utils/sendResponse.js";

// Get organization details
export const getOrganization = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const organizationId = parseInt(req.params.id as string);
    const organization = await getOrganizationById(organizationId);

    return sendResponse(
      res,
      200,
      "Organization fetched successfully",
      organization,
    );
  },
);

// Update organization
export const updateOrganizationDetails = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = updateOrganizationSchema.parse(req.body);
    const userId = req.user?.id;

    const organization = await updateOrganization(
      organizationId,
      validatedData,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Organization updated successfully",
      organization,
    );
  },
);

// Get organization members
export const getMembers = catchAsyncErrors(async (req: any, res: Response) => {
  const organizationId = parseInt(req.params.id);
  const userId = req.user?.id;

  const members = await getOrganizationMembers(organizationId, userId);

  return sendResponse(res, 200, "Members fetched successfully", members);
});

// Add member to organization
export const addMember = catchAsyncErrors(async (req: any, res: Response) => {
  const organizationId = parseInt(req.params.id);
  const validatedData = addMemberSchema.parse(req.body);
  const userId = req.user?.id;

  const member = await addMemberToOrganization(
    validatedData.email,
    validatedData.role,
    organizationId,
    userId,
  );

  return sendResponse(res, 201, "Member added successfully", member);
});

// Update member role
export const updateMember = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = updateMemberRoleSchema.parse(req.body);
    const userId = req.user?.id;

    const member = await updateMemberRole(
      validatedData.memberId,
      validatedData.role,
      organizationId,
      userId,
    );

    return sendResponse(res, 200, "Member role updated successfully", member);
  },
);

// Remove member from organization
export const removeMemberFromOrg = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);
    const userId = req.user?.id;

    const removed = await removeMember(memberId, organizationId, userId);

    return sendResponse(res, 200, "Member removed successfully", removed);
  },
);

// Create department
export const createDepartmentHandler = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = createDepartmentSchema.parse(req.body);
    const userId = req.user?.id;

    const department = await createDepartment(
      organizationId,
      validatedData.name,
      userId,
    );

    return sendResponse(
      res,
      201,
      "Department created successfully",
      department,
    );
  },
);

// Update department
export const updateDepartmentHandler = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const departmentId = parseInt(req.params.departmentId);
    const validatedData = createDepartmentSchema.parse(req.body);
    const userId = req.user?.id;

    const department = await updateDepartment(
      departmentId,
      validatedData.name,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Department updated successfully",
      department,
    );
  },
);

// Delete department
export const deleteDepartmentHandler = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const departmentId = parseInt(req.params.departmentId);
    const userId = req.user?.id;

    const deleted = await deleteDepartment(
      departmentId,
      organizationId,
      userId,
    );

    return sendResponse(res, 200, "Department deleted successfully", deleted);
  },
);

// Get organization departments
export const getDepartments = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const userId = req.user?.id;

    const departments = await getOrganizationDepartments(
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Departments fetched successfully",
      departments,
    );
  },
);

// Assign member to department
export const assignToDepartment = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = assignMemberToDepartmentSchema.parse(req.body);
    const userId = req.user?.id;

    const assignment = await assignMemberToDepartment(
      validatedData.departmentId,
      validatedData.userId,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Member assigned to department successfully",
      assignment,
    );
  },
);

// Remove member from department
export const removeFromDepartment = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const departmentId = parseInt(req.params.departmentId);
    const memberUserId = parseInt(req.params.userId);
    const userId = req.user?.id;

    const removed = await removeMemberFromDepartment(
      departmentId,
      memberUserId,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Member removed from department successfully",
      removed,
    );
  },
);

// Get member permissions
export const getPermissions = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);
    const userId = req.user?.id;

    const permissions = await getMemberPermissions(
      memberId,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "Permissions fetched successfully",
      permissions,
    );
  },
);

// Assign permission to member
export const assignPermission = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = assignPermissionSchema.parse(req.body);
    const userId = req.user?.id;

    const permission = await assignPermissionToMember(
      validatedData.memberId,
      validatedData.module,
      validatedData.action,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      201,
      "Permission assigned successfully",
      permission,
    );
  },
);

// Remove permission
export const removePermissionHandler = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const validatedData = removePermissionSchema.parse(req.body);
    const userId = req.user?.id;

    const removed = await removePermission(
      validatedData.permissionId,
      organizationId,
      userId,
    );

    return sendResponse(res, 200, "Permission removed successfully", removed);
  },
);

// Check if member has permission
export const checkPermission = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const { module, action } = req.query;
    const userId = req.user?.id;

    if (!module || !action) {
      return sendResponse(res, 400, "Module and action are required", null);
    }

    const hasAccess = await checkMemberPermission(
      userId,
      organizationId,
      module as string,
      action as string,
    );

    return sendResponse(res, 200, "Permission checked successfully", {
      hasAccess,
    });
  },
);

// Get user's departments
export const getUserDepartments = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const targetUserId = req.params.userId
      ? parseInt(req.params.userId)
      : req.user?.id;
    const userId = req.user?.id;

    const departments = await getUserDepartmentsList(
      targetUserId,
      organizationId,
      userId,
    );

    return sendResponse(
      res,
      200,
      "User departments fetched successfully",
      departments,
    );
  },
);

// Get available permissions for organization type
export const getPermissionsList = catchAsyncErrors(
  async (req: any, res: Response) => {
    const organizationId = parseInt(req.params.id);
    const organization = await getOrganizationById(organizationId);

    const permissions = await getAvailablePermissions(organization.type);

    return sendResponse(
      res,
      200,
      "Available permissions fetched successfully",
      permissions,
    );
  },
);

// Get organization statistics
export const getStats = catchAsyncErrors(async (req: any, res: Response) => {
  const organizationId = parseInt(req.params.id);
  const userId = req.user?.id;

  const stats = await getOrganizationStatsService(organizationId, userId);

  return sendResponse(res, 200, "Statistics fetched successfully", stats);
});

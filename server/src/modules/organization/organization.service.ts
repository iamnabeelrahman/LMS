import {
  findOrganizationById,
  updateOrganizationInDB,
  findOrganizationMembers,
  findMemberById,
  findMemberByUserIdAndOrgId,
  addMemberToOrganizationInDB,
  updateMemberRoleInDB,
  removeMemberFromOrganizationInDB,
  findDepartmentsByOrganization,
  findDepartmentById,
  createDepartmentInDB,
  updateDepartmentInDB,
  deleteDepartmentInDB,
  assignUserToDepartmentInDB,
  removeUserFromDepartmentInDB,
  findMemberPermissions,
  assignPermissionToMemberInDB,
  removePermissionInDB,
  hasPermission,
  getOrganizationStats,
  findPermissionByModuleAndAction,
  getUserDepartments,
} from "./organization.repository.js";
import { findUserByEmail, findUserById } from "../auth/auth.repository.js";
import {
  CreateOrganizationInput,
  UpdateMemberRoleInput,
  CreateDepartmentInput,
  AssignMemberToDepartmentInput,
  AssignPermissionInput,
  RemovePermissionInput,
} from "./organization.types.js";
import {
  corePermissions,
  schoolPermissions,
  coachingPermissions,
} from "../../config/permission.js";
import { memberPermissions } from "../../db/schema/organizations.schema.js";
import { eq } from "drizzle-orm";
import ErrorHandler from "../../utils/ErrorHandler.js";
import DB from "../../config/db.js";

export const getOrganizationById = async (organizationId: number) => {
  const organization = await findOrganizationById(organizationId);
  if (!organization) {
    throw new ErrorHandler("Organization not found", 404);
  }
  return organization;
};

export const updateOrganization = async (
  organizationId: number,
  data: { name?: string },
  userId: number,
) => {
  const organization = await findOrganizationById(organizationId);
  if (!organization) {
    throw new ErrorHandler("Organization not found", 404);
  }

  // Check if user is owner or admin
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  if (!member || (member.role !== "admin" && organization.ownerId !== userId)) {
    throw new ErrorHandler(
      "You don't have permission to update this organization",
      403,
    );
  }

  const updated = await updateOrganizationInDB(organizationId, data);
  return updated;
};

export const getOrganizationMembers = async (
  organizationId: number,
  userId: number,
) => {
  // Check if user is a member
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  const organization = await findOrganizationById(organizationId);

  if (!member && organization?.ownerId !== userId) {
    throw new ErrorHandler("You don't have permission to view members", 403);
  }

  const members = await findOrganizationMembers(organizationId);
  return members;
};

export const addMemberToOrganization = async (
  email: string,
  role: "admin" | "teacher" | "staff",
  organizationId: number,
  addedBy: number,
) => {
  // Check if adder has permission
  const adderMember = await findMemberByUserIdAndOrgId(addedBy, organizationId);
  const organization = await findOrganizationById(organizationId);

  if (!adderMember && organization?.ownerId !== addedBy) {
    throw new ErrorHandler("You don't have permission to add members", 403);
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user || user.length === 0) {
    throw new ErrorHandler("User not found", 404);
  }

  const newUser = user[0];

  // Check if already a member
  const existingMember = await findMemberByUserIdAndOrgId(
    newUser.id,
    organizationId,
  );
  if (existingMember) {
    throw new ErrorHandler(
      "User is already a member of this organization",
      400,
    );
  }

  // Add member
  const member = await addMemberToOrganizationInDB(
    newUser.id,
    organizationId,
    role,
  );

  // If organization is school, assign to default departments based on role
  if (organization?.type === "school" && role === "teacher") {
    // Get default departments
    const departments = await findDepartmentsByOrganization(organizationId);
    const defaultDepts = departments.filter((d) =>
      ["Mathematics", "Science", "Languages"].includes(d.name),
    );

    for (const dept of defaultDepts) {
      await assignUserToDepartmentInDB(dept.id, newUser.id);
    }
  }

  return {
    ...member,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    },
  };
};

export const updateMemberRole = async (
  memberId: number,
  role: "admin" | "teacher" | "staff",
  organizationId: number,
  updatedBy: number,
) => {
  // Check if updater has permission
  const updaterMember = await findMemberByUserIdAndOrgId(
    updatedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!updaterMember && organization?.ownerId !== updatedBy) {
    throw new ErrorHandler(
      "You don't have permission to update member roles",
      403,
    );
  }

  // Cannot update owner
  const member = await findMemberById(memberId);
  if (!member) {
    throw new ErrorHandler("Member not found", 404);
  }

  if (organization?.ownerId === member.userId) {
    throw new ErrorHandler("Cannot change owner's role", 400);
  }

  const updated = await updateMemberRoleInDB(memberId, role);
  return updated;
};

export const removeMember = async (
  memberId: number,
  organizationId: number,
  removedBy: number,
) => {
  // Check if remover has permission
  const removerMember = await findMemberByUserIdAndOrgId(
    removedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!removerMember && organization?.ownerId !== removedBy) {
    throw new ErrorHandler("You don't have permission to remove members", 403);
  }

  const member = await findMemberById(memberId);
  if (!member) {
    throw new ErrorHandler("Member not found", 404);
  }

  // Cannot remove owner
  if (organization?.ownerId === member.userId) {
    throw new ErrorHandler("Cannot remove organization owner", 400);
  }

  const removed = await removeMemberFromOrganizationInDB(
    memberId,
    organizationId,
  );
  return removed;
};

export const createDepartment = async (
  organizationId: number,
  name: string,
  createdBy: number,
) => {
  // Check if creator has permission
  const creatorMember = await findMemberByUserIdAndOrgId(
    createdBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!creatorMember && organization?.ownerId !== createdBy) {
    throw new ErrorHandler(
      "You don't have permission to create departments",
      403,
    );
  }

  const department = await createDepartmentInDB(organizationId, name);
  return department;
};

export const updateDepartment = async (
  departmentId: number,
  name: string,
  organizationId: number,
  updatedBy: number,
) => {
  const department = await findDepartmentById(departmentId);
  if (!department || department.organizationId !== organizationId) {
    throw new ErrorHandler("Department not found", 404);
  }

  // Check permission
  const updaterMember = await findMemberByUserIdAndOrgId(
    updatedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!updaterMember && organization?.ownerId !== updatedBy) {
    throw new ErrorHandler(
      "You don't have permission to update departments",
      403,
    );
  }

  const updated = await updateDepartmentInDB(departmentId, name);
  return updated;
};

export const deleteDepartment = async (
  departmentId: number,
  organizationId: number,
  deletedBy: number,
) => {
  const department = await findDepartmentById(departmentId);
  if (!department || department.organizationId !== organizationId) {
    throw new ErrorHandler("Department not found", 404);
  }

  // Check permission
  const deleterMember = await findMemberByUserIdAndOrgId(
    deletedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!deleterMember && organization?.ownerId !== deletedBy) {
    throw new ErrorHandler(
      "You don't have permission to delete departments",
      403,
    );
  }

  const deleted = await deleteDepartmentInDB(departmentId);
  return deleted;
};

export const assignMemberToDepartment = async (
  departmentId: number,
  userId: number,
  organizationId: number,
  assignedBy: number,
) => {
  const department = await findDepartmentById(departmentId);
  if (!department || department.organizationId !== organizationId) {
    throw new ErrorHandler("Department not found", 404);
  }

  // Check if user is a member of the organization
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  if (!member) {
    throw new ErrorHandler("User is not a member of this organization", 400);
  }

  // Check permission
  const assignerMember = await findMemberByUserIdAndOrgId(
    assignedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!assignerMember && organization?.ownerId !== assignedBy) {
    throw new ErrorHandler(
      "You don't have permission to assign members to departments",
      403,
    );
  }

  const assignment = await assignUserToDepartmentInDB(departmentId, userId);
  return assignment;
};

export const removeMemberFromDepartment = async (
  departmentId: number,
  userId: number,
  organizationId: number,
  removedBy: number,
) => {
  const department = await findDepartmentById(departmentId);
  if (!department || department.organizationId !== organizationId) {
    throw new ErrorHandler("Department not found", 404);
  }

  // Check permission
  const removerMember = await findMemberByUserIdAndOrgId(
    removedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!removerMember && organization?.ownerId !== removedBy) {
    throw new ErrorHandler(
      "You don't have permission to remove members from departments",
      403,
    );
  }

  const removed = await removeUserFromDepartmentInDB(departmentId, userId);
  return removed;
};

export const getMemberPermissions = async (
  memberId: number,
  organizationId: number,
  requestedBy: number,
) => {
  // Check if requester has permission
  const member = await findMemberById(memberId);
  if (!member || member.organizationId !== organizationId) {
    throw new ErrorHandler("Member not found", 404);
  }

  const requesterMember = await findMemberByUserIdAndOrgId(
    requestedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!requesterMember && organization?.ownerId !== requestedBy) {
    throw new ErrorHandler(
      "You don't have permission to view permissions",
      403,
    );
  }

  const permissions = await findMemberPermissions(memberId);
  return permissions;
};

export const assignPermissionToMember = async (
  memberId: number,
  module: string,
  action: string,
  organizationId: number,
  assignedBy: number,
) => {
  const member = await findMemberById(memberId);
  if (!member || member.organizationId !== organizationId) {
    throw new ErrorHandler("Member not found", 404);
  }

  // Check if assigner has permission to assign permissions
  const assignerMember = await findMemberByUserIdAndOrgId(
    assignedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!assignerMember && organization?.ownerId !== assignedBy) {
    throw new ErrorHandler(
      "You don't have permission to assign permissions",
      403,
    );
  }

  // Check if permission already exists
  const existingPermission = await findPermissionByModuleAndAction(
    memberId,
    module,
    action,
  );
  if (existingPermission) {
    throw new ErrorHandler("Permission already assigned", 400);
  }

  const permission = await assignPermissionToMemberInDB(
    memberId,
    module,
    action,
  );
  return permission;
};

export const removePermission = async (
  permissionId: number,
  organizationId: number,
  removedBy: number,
) => {
  const permission = await DB.select()
    .from(memberPermissions)
    .where(eq(memberPermissions.id, permissionId));

  if (!permission || permission.length === 0) {
    throw new ErrorHandler("Permission not found", 404);
  }

  const member = await findMemberById(permission[0].memberId);
  if (!member || member.organizationId !== organizationId) {
    throw new ErrorHandler("Permission not found", 404);
  }

  // Check if remover has permission
  const removerMember = await findMemberByUserIdAndOrgId(
    removedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!removerMember && organization?.ownerId !== removedBy) {
    throw new ErrorHandler(
      "You don't have permission to remove permissions",
      403,
    );
  }

  const removed = await removePermissionInDB(permissionId);
  return removed;
};

export const checkMemberPermission = async (
  userId: number,
  organizationId: number,
  module: string,
  action: string,
): Promise<boolean> => {
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  if (!member) return false;

  // Check if user is admin or owner
  const organization = await findOrganizationById(organizationId);
  if (member.role === "admin" || organization?.ownerId === userId) {
    return true;
  }

  return await hasPermission(member.id, module, action);
};

export const getOrganizationDepartments = async (
  organizationId: number,
  userId: number,
) => {
  // Check if user is a member
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  const organization = await findOrganizationById(organizationId);

  if (!member && organization?.ownerId !== userId) {
    throw new ErrorHandler(
      "You don't have permission to view departments",
      403,
    );
  }

  const departmentsList = await findDepartmentsByOrganization(organizationId);
  return departmentsList;
};

export const getUserDepartmentsList = async (
  userId: number,
  organizationId: number,
  requestedBy: number,
) => {
  // Check if requester has permission
  const requesterMember = await findMemberByUserIdAndOrgId(
    requestedBy,
    organizationId,
  );
  const organization = await findOrganizationById(organizationId);

  if (!requesterMember && organization?.ownerId !== requestedBy) {
    throw new ErrorHandler(
      "You don't have permission to view user departments",
      403,
    );
  }

  const userDepts = await getUserDepartments(userId, organizationId);
  return userDepts;
};

export const getAvailablePermissions = async (organizationType: string) => {
  const allPermissions = [...corePermissions];

  if (organizationType === "school") {
    allPermissions.push(...schoolPermissions);
  } else if (organizationType === "coaching") {
    allPermissions.push(...coachingPermissions);
  }

  return allPermissions;
};

export const getOrganizationStatsService = async (
  organizationId: number,
  userId: number,
) => {
  const member = await findMemberByUserIdAndOrgId(userId, organizationId);
  const organization = await findOrganizationById(organizationId);

  if (!member && organization?.ownerId !== userId) {
    throw new ErrorHandler("You don't have permission to view stats", 403);
  }

  const stats = await getOrganizationStats(organizationId);
  return stats;
};

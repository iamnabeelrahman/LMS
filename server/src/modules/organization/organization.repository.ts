import { eq, and, inArray, not, sql } from "drizzle-orm";

import type { PgTransaction } from "drizzle-orm/pg-core";
import DB from "../../config/db.js";
import { departmentMembers, departments, memberPermissions, organizationMembers, organizations } from "../../db/schema/organizations.schema.js";
import { users } from "../../db/schema/users.schema.js";

// Organization CRUD
export const findOrganizationById = async (organizationId: number) => {
  const [organization] = await DB.select()
    .from(organizations)
    .where(eq(organizations.id, organizationId));
  return organization;
};

export const updateOrganizationInDB = async (
  organizationId: number,
  data: { name?: string },
) => {
  const [updated] = await DB.update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId))
    .returning();
  return updated;
};

// Members
export const findOrganizationMembers = async (organizationId: number) => {
  const members = await DB.select({
    id: organizationMembers.id,
    organizationId: organizationMembers.organizationId,
    userId: organizationMembers.userId,
    role: organizationMembers.role,
    joinedAt: organizationMembers.joinedAt,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
    },
  })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId));

  return members;
};

export const findMemberById = async (memberId: number) => {
  const [member] = await DB.select()
    .from(organizationMembers)
    .where(eq(organizationMembers.id, memberId));
  return member;
};

export const findMemberByUserIdAndOrgId = async (
  userId: number,
  organizationId: number,
) => {
  const [member] = await DB.select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    );
  return member;
};

export const addMemberToOrganizationInDB = async (
  userId: number,
  organizationId: number,
  role: "admin" | "teacher" | "staff",
) => {
  const [member] = await DB.insert(organizationMembers)
    .values({
      userId,
      organizationId,
      role,
    })
    .returning();
  return member;
};

export const updateMemberRoleInDB = async (
  memberId: number,
  role: "admin" | "teacher" | "staff",
) => {
  const [updated] = await DB.update(organizationMembers)
    .set({ role })
    .where(eq(organizationMembers.id, memberId))
    .returning();
  return updated;
};

export const removeMemberFromOrganizationInDB = async (
  memberId: number,
  organizationId: number,
) => {
  const [removed] = await DB.delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.id, memberId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .returning();

  // Also remove all permissions for this member
  await DB.delete(memberPermissions).where(
    eq(memberPermissions.memberId, memberId),
  );

  // Remove from departments
  await DB.delete(departmentMembers).where(
    eq(departmentMembers.userId, removed.userId),
  );

  return removed;
};

// Departments
export const findDepartmentsByOrganization = async (organizationId: number) => {
  const departmentsList = await DB.select()
    .from(departments)
    .where(eq(departments.organizationId, organizationId));
  return departmentsList;
};

export const findDepartmentById = async (departmentId: number) => {
  const [department] = await DB.select()
    .from(departments)
    .where(eq(departments.id, departmentId));
  return department;
};

export const createDepartmentInDB = async (
  organizationId: number,
  name: string,
) => {
  const [department] = await DB.insert(departments)
    .values({
      organizationId,
      name,
    })
    .returning();
  return department;
};

export const updateDepartmentInDB = async (
  departmentId: number,
  name: string,
) => {
  const [updated] = await DB.update(departments)
    .set({ name })
    .where(eq(departments.id, departmentId))
    .returning();
  return updated;
};

export const deleteDepartmentInDB = async (departmentId: number) => {
  // Remove all department members first
  await DB.delete(departmentMembers).where(
    eq(departmentMembers.departmentId, departmentId),
  );

  const [deleted] = await DB.delete(departments)
    .where(eq(departments.id, departmentId))
    .returning();
  return deleted;
};

// Department Members
export const findDepartmentMembers = async (departmentId: number) => {
  const members = await DB.select({
    id: departmentMembers.id,
    departmentId: departmentMembers.departmentId,
    userId: departmentMembers.userId,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
    },
  })
    .from(departmentMembers)
    .leftJoin(users, eq(departmentMembers.userId, users.id))
    .where(eq(departmentMembers.departmentId, departmentId));
  return members;
};

export const assignUserToDepartmentInDB = async (
  departmentId: number,
  userId: number,
) => {
  const [assignment] = await DB.insert(departmentMembers)
    .values({
      departmentId,
      userId,
    })
    .returning();
  return assignment;
};

export const removeUserFromDepartmentInDB = async (
  departmentId: number,
  userId: number,
) => {
  const [removed] = await DB.delete(departmentMembers)
    .where(
      and(
        eq(departmentMembers.departmentId, departmentId),
        eq(departmentMembers.userId, userId),
      ),
    )
    .returning();
  return removed;
};

export const getUserDepartments = async (
  userId: number,
  organizationId: number,
) => {
  const userDepts = await DB.select({
    departmentId: departments.id,
    departmentName: departments.name,
  })
    .from(departmentMembers)
    .leftJoin(departments, eq(departmentMembers.departmentId, departments.id))
    .where(
      and(
        eq(departmentMembers.userId, userId),
        eq(departments.organizationId, organizationId),
      ),
    );
  return userDepts;
};

// Permissions
export const findMemberPermissions = async (memberId: number) => {
  const permissions = await DB.select()
    .from(memberPermissions)
    .where(eq(memberPermissions.memberId, memberId));
  return permissions;
};

export const assignPermissionToMemberInDB = async (
  memberId: number,
  module: string,
  action: string,
) => {
  const [permission] = await DB.insert(memberPermissions)
    .values({
      memberId,
      module,
      action,
    })
    .returning();
  return permission;
};

export const removePermissionInDB = async (permissionId: number) => {
  const [removed] = await DB.delete(memberPermissions)
    .where(eq(memberPermissions.id, permissionId))
    .returning();
  return removed;
};

export const findPermissionByModuleAndAction = async (
  memberId: number,
  module: string,
  action: string,
) => {
  const [permission] = await DB.select()
    .from(memberPermissions)
    .where(
      and(
        eq(memberPermissions.memberId, memberId),
        eq(memberPermissions.module, module),
        eq(memberPermissions.action, action),
      ),
    );
  return permission;
};

export const hasPermission = async (
  memberId: number,
  module: string,
  action: string,
): Promise<boolean> => {
  const permission = await findPermissionByModuleAndAction(
    memberId,
    module,
    action,
  );
  return !!permission;
};

// Statistics
export const getOrganizationStats = async (organizationId: number) => {
  const membersCount = await DB.select({ count: sql<number>`count(*)` })
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, organizationId));

  const departmentsCount = await DB.select({ count: sql<number>`count(*)` })
    .from(departments)
    .where(eq(departments.organizationId, organizationId));

  return {
    members: membersCount[0]?.count || 0,
    departments: departmentsCount[0]?.count || 0,
  };
};

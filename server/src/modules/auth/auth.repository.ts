import { eq, and, or } from "drizzle-orm";
import DB from "../../config/db.js";
import { IUserInsert, users } from "../../db/schema/users.schema.js";
import { type PgTransaction } from "drizzle-orm/pg-core";
import {
  departments,
  organizationMembers,
  organizations,
} from "../../db/schema/organizations.schema.js";

type NewUser = typeof users.$inferInsert;

// User queries
export const findUserByEmail = async (email: string) => {
  return await DB.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
};

export const findUserById = async (id: number) => {
  return await DB.select().from(users).where(eq(users.id, id));
};

export const findUserByPhoneNumber = async (phoneNumber: string) => {
  return await DB.select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber));
};

// Transaction functions
export const createUserInTransaction = async (
  tx: PgTransaction<any, any, any>,
  userData: IUserInsert,
) => {
  const [user] = await tx.insert(users).values(userData).returning();
  return user;
};

export const createOrganizationInTransaction = async (
  tx: PgTransaction<any, any, any>,
  name: string,
  type: "school" | "coaching" | "teacher_academy",
  ownerId: number,
) => {
  const [org] = await tx
    .insert(organizations)
    .values({
      name,
      type,
      ownerId,
    })
    .returning();

  return org;
};

export const addUserToOrganizationInTransaction = async (
  tx: PgTransaction<any, any, any>,
  userId: number,
  organizationId: number,
  role: "admin" | "teacher" | "staff",
) => {
  const [member] = await tx
    .insert(organizationMembers)
    .values({
      userId,
      organizationId,
      role,
    })
    .returning();

  return member;
};

export const createDefaultDepartmentsInTransaction = async (
  tx: PgTransaction<any, any, any>,
  organizationId: number,
) => {
  const defaultDepartments = [
    { name: "Mathematics", organizationId },
    { name: "Science", organizationId },
    { name: "Languages", organizationId },
    { name: "Arts", organizationId },
    { name: "Sports", organizationId },
  ];

  const departments1 = await tx
    .insert(departments)
    .values(defaultDepartments)
    .returning();

  return departments1;
};

// Organization queries

export const getUserOrganizationsFromDB = async (userId: number) => {
  const results = await DB.select({
    organizationId: organizations.id,
    orgName: organizations.name,
    orgType: organizations.type,
    ownerId: organizations.ownerId,
    role: organizationMembers.role,
  })
    .from(organizations)
    .leftJoin(
      organizationMembers,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      or(
        eq(organizations.ownerId, userId), // user is owner
        eq(organizationMembers.userId, userId), // user is member
      ),
    );

  return results.map((org) => ({
    id: org.organizationId,
    name: org.orgName,
    type: org.orgType,
    role:
      org.ownerId === userId
        ? "admin"
        : (org.role as "admin" | "teacher" | "staff"),
    isOwner: org.ownerId === userId,
  }));
};

export const getUserMembership = async (
  userId: number,
  organizationId: number,
) => {
  const [membership] = await DB.select({
    role: organizationMembers.role,
    organizationId: organizations.id,
    ownerId: organizations.ownerId,
  })
    .from(organizationMembers)
    .leftJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    );

  if (!membership) return null;

  return {
    role: membership.role as "admin" | "teacher" | "staff",
    isOwner: membership.ownerId === userId,
    organizationId: membership.organizationId,
  };
};

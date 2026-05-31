import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import DB from "../config/db.js";
import {
  memberPermissions,
  organizationMembers,
} from "../db/schema/organizations.schema.js";
import { and, eq } from "drizzle-orm";
import { rolePermissions } from "../config/permission.js";

export const organizationMemberMiddleware = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return next(new ErrorHandler("User id is required", 400));
    const organizationId = Number(req.user?.organizationId);

    if (!organizationId) {
      return next(new ErrorHandler("Organization id is required", 400));
    }

    if (req.user?.isOwner) {
      req.member = {
        id: req.user.id,
        role: "owner",
        organizationId,
        isOwner: true,
      };

      return next();
    }

    const member = await getOrganizationMember(userId, organizationId);

    if (!member) {
      return next(
        new ErrorHandler("You are not a member of this organization", 403),
      );
    }

    req.member = member;

    next();
  },
);

export const loadMemberPermissionsMiddleware = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;

    if (!member) {
      return next(new ErrorHandler("Membership not found", 403));
    }

    const permissions = await DB.select({
      module: memberPermissions.module,
      action: memberPermissions.action,
    })
      .from(memberPermissions)
      .where(eq(memberPermissions.memberId, member.id));

    req.memberPermissions = permissions.map((p) => `${p.module}:${p.action}`);

    next();
  },
);

export const requirePermission = (module: string, action: string) => {
  return catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
      const member = req.member;

      if (!member) {
        return next(new ErrorHandler("Membership not found", 403));
      }

      if (member.isOwner) {
        return next();
      }

      const permissionKey = `${module}:${action}`;

      const rolePerms = rolePermissions[member.role] || [];

      // role permissions
      if (rolePerms.includes("*") || rolePerms.includes(permissionKey)) {
        return next();
      }

      // custom permissions
      if (req.memberPermissions?.includes(permissionKey)) {
        return next();
      }

      return next(new ErrorHandler("Forbidden", 403));
    },
  );
};

export const getOrganizationMember = async (
  userId: number,
  organizationId: number,
) => {
  const [member] = await DB.select({
    id: organizationMembers.id,
    role: organizationMembers.role,
    organizationId: organizationMembers.organizationId,
  })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    );

  return member || null;
};

export const getMemberPermission = async (
  memberId: number,
  module: string,
  action: string,
) => {
  const [permission] = await DB.select({
    id: memberPermissions.id,
  })
    .from(memberPermissions)
    .where(
      and(
        eq(memberPermissions.memberId, memberId),
        eq(memberPermissions.module, module),
        eq(memberPermissions.action, action),
      ),
    );

  return permission || null;
};

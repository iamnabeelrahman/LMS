import type { Request, Response, NextFunction } from "express";
import { findMemberByUserIdAndOrgId } from "./organization.repository.js";
import { findOrganizationById } from "./organization.repository.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const checkOrganizationAccess = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, "Unauthorized", null);
    }

    const organization = await findOrganizationById(organizationId);
    if (!organization) {
      return sendResponse(res, 404, "Organization not found", null);
    }

    const member = await findMemberByUserIdAndOrgId(userId, organizationId);

    // Check if user is owner or member
    if (organization.ownerId !== userId && !member) {
      return sendResponse(
        res,
        403,
        "You don't have access to this organization",
        null,
      );
    }

    // Attach organization and member info to request
    req.organization = organization;
    req.organizationMember = member;

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error", null);
  }
};

import { redis } from "../config/redis.js";
import { OrganizationInfo } from "../modules/auth/auth.types.js";

const USER_ORGS_PREFIX = "user_orgs:";
const CACHE_TTL = 3600 * 24; // 1 hour

export const cacheUserOrganizations = async (
  userId: number,
  organizations: any,
) => {
  const key = `${USER_ORGS_PREFIX}${userId}`;
  await redis.set(key, JSON.stringify(organizations), {
    ex: CACHE_TTL,
  });
};

export const updateCurrentOrganizationInCache = async (
  userId: number,
  organizationId: number,
) => {
  // Get all organizations
  const key = `${USER_ORGS_PREFIX}${userId}`;
  const cached = await redis.get(key);
  console.log(typeof cached);
  if (!cached) return;

  const organizations =
    typeof cached === "string" ? JSON.parse(cached) : cached;

  // Update current flag for all organizations
  const updatedOrgs = organizations.map((org: OrganizationInfo) => ({
    ...org,
    currentOrganization: org.id === organizationId,
  }));

  // Save updated organizations
  await redis.set(key, JSON.stringify(updatedOrgs), { ex: CACHE_TTL });
};

export const getUserOrganizationsFromCache = async (userId: number) => {
  const key = `${USER_ORGS_PREFIX}${userId}`;
  const cached = await redis.get(key);

  if (!cached) return null;

  if (typeof cached === "string") {
    return JSON.parse(cached);
  }

  return cached; // already parsed
};

export const invalidateUserOrgCache = async (userId: number) => {
  const key = `${USER_ORGS_PREFIX}${userId}`;
  await redis.del(key);
};

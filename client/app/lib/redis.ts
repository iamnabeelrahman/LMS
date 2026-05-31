import { redis } from "../config/redis.js";
import { OrganizationInfo } from "../types/organization.js";

const USER_ORGS_PREFIX = "user_orgs:";
const CACHE_TTL = 3600 * 24; //

export const getUserOrganizationsFromCache = async (userId: number) => {
  const key = `${USER_ORGS_PREFIX}${userId}`;
  const cached = await redis.get(key);
  
  if (!cached) return null;

  if (typeof cached === "string") {
    return JSON.parse(cached);
  }

  return cached;
};

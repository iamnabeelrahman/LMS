import "express";

export interface AuthUser {
  id: number;
  organizationId: number;
  systemRole: string;
  organizationRole: string;
  isOwner: boolean;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

import { Request } from "express";
import { IUser } from "../src/db/schema/users.schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      cookies?: {
        [key: string]: string;
      };
      member?: {
        id: number;
        role: "admin" | "teacher" | "staff" | "owner";
        organizationId: number;
        isOwner?: boolean;
      };
      memberPermissions?: string[];
    }
  }
}

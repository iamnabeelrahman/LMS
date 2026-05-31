import { RegisterUserInput } from "./auth.validation.js";

export interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none" | undefined;
  secure?: boolean;
}

export interface JwtPayload {
  id: number;
  systemRole: string;
  organizationRole?: string;
  organizationId?: number;
  isOwner?: boolean;
  type?: "org_selection";
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    age: number;
    avatar?: string;
    systemRole: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  organizations?: OrganizationInfo[];
  requiresOrgSelection?: boolean;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}

export interface OrganizationInfo {
  id: number;
  name: string;
  type: "school" | "coaching" | "teacher_academy";
  role: "admin" | "teacher" | "staff";
  isOwner: boolean;
  currentOrganization?: boolean;
}

export interface RegisterWithOrgInput extends RegisterUserInput {
  organization?: {
    name: string;
    type: "school" | "coaching" | "teacher_academy";
  };
  organizationId?: number; // For joining existing org
  orgRole?: "admin" | "teacher" | "student" | "parent" | "staff";
}

export interface OrganizationResponse {
  id: number;
  name: string;
  type: "school" | "coaching" | "teacher_academy";
  role: "admin" | "teacher" | "student" | "parent" | "staff";
  joinedAt: Date;
}

export interface UserWithOrganizations {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  avatar?: string;
  systemRole: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  organizations: OrganizationResponse[];
}

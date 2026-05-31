export interface OrganizationInfo {
  id: number;
  name: string;
  type: "school" | "coaching" | "teacher_academy";
  ownerId: number;
  createdAt: Date;
}

export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  role: "admin" | "teacher" | "staff";
  joinedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Department {
  id: number;
  organizationId: number;
  name: string;
}

export interface DepartmentMember {
  id: number;
  departmentId: number;
  userId: number;
}

export interface MemberPermission {
  id: number;
  memberId: number;
  module: string;
  action: string;
  createdAt: Date;
}

export interface PermissionCheck {
  module: string;
  action: string;
}

export interface CreateOrganizationInput {
  name: string;
  type: "school" | "coaching" | "teacher_academy";
  ownerId: number;
}

export interface AddMemberInput {
  email: string;
  role: "admin" | "teacher" | "staff";
  organizationId: number;
  addedBy: number;
}

export interface UpdateMemberRoleInput {
  memberId: number;
  role: "admin" | "teacher" | "staff";
  organizationId: number;
  updatedBy: number;
}

export interface CreateDepartmentInput {
  name: string;
  organizationId: number;
  createdBy: number;
}

export interface AssignMemberToDepartmentInput {
  departmentId: number;
  userId: number;
  organizationId: number;
  assignedBy: number;
}

export interface AssignPermissionInput {
  memberId: number;
  module: string;
  action: string;
  organizationId: number;
  assignedBy: number;
}

export interface RemovePermissionInput {
  permissionId: number;
  organizationId: number;
  removedBy: number;
}

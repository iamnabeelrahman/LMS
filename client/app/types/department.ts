export interface Department {
  id: number;
  organizationId: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentMember {
  id: number;
  departmentId: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface OrganizationMember {
  id: number;
  userId: number;
  organizationId: number;
  role: "admin" | "teacher" | "staff";
  joinedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface AIAssistantRequest {
  prompt: string;
  context: {
    organizationId: number;
    departments?: Department[];
    members?: OrganizationMember[];
  };
}

export interface AIAssistantResponse {
  suggestion: string;
  actions?: {
    type: "create" | "assign" | "rename" | "delete";
    data: any;
  }[];
}

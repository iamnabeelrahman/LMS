
export interface OrganizationInfo {
  id: number;
  name: string;
  type: "school" | "coaching" | "teacher_academy";
  role: "admin" | "teacher" | "staff";
  isOwner: boolean;
  currentOrganization?: boolean; 
}


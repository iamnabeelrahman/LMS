import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  type: z.enum(["school", "coaching", "teacher_academy"]),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "teacher", "staff"]),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.number().int().positive(),
  role: z.enum(["admin", "teacher", "staff"]),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
});

export const assignMemberToDepartmentSchema = z.object({
  departmentId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const assignPermissionSchema = z.object({
  memberId: z.number().int().positive(),
  module: z.string().min(1, "Module is required"),
  action: z.string().min(1, "Action is required"),
});

export const removePermissionSchema = z.object({
  permissionId: z.number().int().positive(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type AssignMemberToDepartmentInput = z.infer<
  typeof assignMemberToDepartmentSchema
>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type RemovePermissionInput = z.infer<typeof removePermissionSchema>;

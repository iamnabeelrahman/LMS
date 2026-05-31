import { z } from "zod";

export const registerUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phoneNumber: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z.number().min(1).max(100),
    avatar: z.string().optional(),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const registerWithOrganizationSchema = z
  .object({
    // User fields
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phoneNumber: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z.number().min(1).max(100),
    avatar: z.string().optional(),

    // Organization fields
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters"),
    organizationType: z
      .enum(["school", "coaching", "teacher_academy"])
      .catch(() => {
        throw new Error(
          "Organization type must be school, coaching, or teacher_academy",
        );
      }),
    role: z
      .enum(["admin", "teacher", "student", "parent", "staff"])
      .default("staff"),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterAsOrganizationInput = z.infer<
  typeof registerWithOrganizationSchema
>;

// Login schemas
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;



export interface ILoginRequest {
  body: LoginUserInput;
}

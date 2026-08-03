import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["requester", "approver", "admin"]),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const requestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80),
  category: z.string().min(1, "Select a category"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  notes: z.string().max(500).optional(),
});
export type RequestValues = z.infer<typeof requestSchema>;

export const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["requester", "approver", "admin"]),
});
export type UserValues = z.infer<typeof userSchema>;

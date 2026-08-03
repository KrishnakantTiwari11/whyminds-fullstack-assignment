import { z } from 'zod';
import { Role } from '@prisma/client';

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(Role).optional(),
  search: z.string().trim().min(1).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });

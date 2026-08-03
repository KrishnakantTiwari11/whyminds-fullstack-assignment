import { z } from 'zod';
import { RequestStatus } from '@prisma/client';

export const idParamSchema = z.object({ id: z.string().uuid() });

export const listRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(RequestStatus).optional(),
  search: z.string().trim().min(1).optional(),
});

export const createRequestSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(3).max(2000),
  amount: z.coerce.number().positive().max(1_000_000),
});

export const updateRequestSchema = z
  .object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(3).max(2000).optional(),
    amount: z.coerce.number().positive().max(1_000_000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });

export const decisionSchema = z.object({
  status: z.enum([RequestStatus.APPROVED, RequestStatus.REJECTED]),
  decisionNote: z.string().max(500).optional(),
});

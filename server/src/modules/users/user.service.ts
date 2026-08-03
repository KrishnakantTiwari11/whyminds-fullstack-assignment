import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashPassword } from '../../utils/password';

const select = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userService = {
  async list(params: { page: number; pageSize: number; role?: Role; search?: string }) {
    const where: Prisma.UserWhereInput = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page: params.page, pageSize: params.pageSize };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async create(input: { name: string; email: string; password: string; role: Role }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict('Email is already registered');

    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash: await hashPassword(input.password),
      },
      select,
    });
  },

  async update(id: string, input: { name?: string; role?: Role; isActive?: boolean }) {
    await userService.getById(id);
    return prisma.user.update({ where: { id }, data: input, select });
  },

  async remove(id: string, actingUserId: string) {
    if (id === actingUserId) throw ApiError.badRequest('You cannot delete your own account');
    await userService.getById(id);
    await prisma.user.delete({ where: { id } });
  },
};

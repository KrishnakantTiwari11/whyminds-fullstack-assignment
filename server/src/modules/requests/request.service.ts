import { Prisma, RequestStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { AuthUser } from '../../types/express';

const include = {
  requester: { select: { id: true, name: true, email: true } },
  approver: { select: { id: true, name: true, email: true } },
} satisfies Prisma.RequestInclude;

/** Requesters only ever see their own rows; approvers and admins see everything. */
const scopeFor = (user: AuthUser): Prisma.RequestWhereInput =>
  user.role === Role.REQUESTER ? { requesterId: user.id } : {};

export const requestService = {
  async list(
    user: AuthUser,
    params: { page: number; pageSize: number; status?: RequestStatus; search?: string },
  ) {
    const where: Prisma.RequestWhereInput = {
      ...scopeFor(user),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { title: { contains: params.search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.request.count({ where }),
    ]);

    return { items, total, page: params.page, pageSize: params.pageSize };
  },

  async getById(user: AuthUser, id: string) {
    const record = await prisma.request.findUnique({ where: { id }, include });
    if (!record) throw ApiError.notFound('Request not found');
    if (user.role === Role.REQUESTER && record.requesterId !== user.id) {
      throw ApiError.forbidden('You can only access your own requests');
    }
    return record;
  },

  create(user: AuthUser, input: { title: string; description: string; amount: number }) {
    return prisma.request.create({
      data: { ...input, amount: new Prisma.Decimal(input.amount), requesterId: user.id },
      include,
    });
  },

  async update(user: AuthUser, id: string, input: { title?: string; description?: string; amount?: number }) {
    const record = await requestService.getById(user, id);
    if (record.status !== RequestStatus.PENDING)
      throw ApiError.badRequest('Only pending requests can be edited');
    if (user.role !== Role.ADMIN && record.requesterId !== user.id) {
      throw ApiError.forbidden('You can only edit your own requests');
    }

    return prisma.request.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.amount !== undefined ? { amount: new Prisma.Decimal(input.amount) } : {}),
      },
      include,
    });
  },

  async decide(user: AuthUser, id: string, input: { status: RequestStatus; decisionNote?: string }) {
    const record = await prisma.request.findUnique({ where: { id } });
    if (!record) throw ApiError.notFound('Request not found');
    if (record.status !== RequestStatus.PENDING)
      throw ApiError.badRequest('Request has already been decided');
    if (record.requesterId === user.id) throw ApiError.forbidden('You cannot decide on your own request');

    return prisma.request.update({
      where: { id },
      data: {
        status: input.status,
        decisionNote: input.decisionNote ?? null,
        approverId: user.id,
        decidedAt: new Date(),
      },
      include,
    });
  },

  async remove(user: AuthUser, id: string) {
    const record = await requestService.getById(user, id);
    if (user.role !== Role.ADMIN && record.requesterId !== user.id) {
      throw ApiError.forbidden('You can only delete your own requests');
    }
    await prisma.request.delete({ where: { id } });
  },

  async stats(user: AuthUser) {
    const where = scopeFor(user);
    const grouped = await prisma.request.groupBy({ by: ['status'], where, _count: { _all: true } });
    const base: Record<RequestStatus, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const row of grouped) base[row.status] = row._count._all;
    return { ...base, total: base.PENDING + base.APPROVED + base.REJECTED };
  },
};

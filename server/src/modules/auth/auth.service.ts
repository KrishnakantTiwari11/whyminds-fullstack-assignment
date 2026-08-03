import { Role, type User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, verifyPassword } from '../../utils/password';
import {
  hashToken,
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import type { LoginInput, RegisterInput } from './auth.schema';
import crypto from 'node:crypto';

const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const issueTokens = async (user: User) => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiryDate(refreshToken),
    },
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict('Email is already registered');

    // Self-service signup can never mint an ADMIN; admins are created by admins.
    const role = input.role && input.role !== Role.ADMIN ? input.role : Role.REQUESTER;

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role,
      },
    });

    return { user: publicUser(user), tokens: await issueTokens(user) };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('Account is disabled');

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    return { user: publicUser(user), tokens: await issueTokens(user) };
  },

  /** Rotates the refresh token: the presented token is revoked and a new pair is issued. */
  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token is no longer valid');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw ApiError.unauthorized('User is not allowed to refresh');

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return { user: publicUser(user), tokens: await issueTokens(user) };
  },

  async logout(userId: string, token?: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return publicUser(user);
  },
};

import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { isProduction } from '../../config/env';
import { authService } from './auth.service';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const readRefreshToken = (req: Request): string | undefined =>
  (req.body as { refreshToken?: string })?.refreshToken ??
  (req.cookies as Record<string, string> | undefined)?.refreshToken;

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.tokens.refreshToken, refreshCookieOptions);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.tokens.refreshToken, refreshCookieOptions);
    res.json({ success: true, data: result });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = readRefreshToken(req);
    if (!token) throw ApiError.unauthorized('Refresh token missing');
    const result = await authService.refresh(token);
    res.cookie('refreshToken', result.tokens.refreshToken, refreshCookieOptions);
    res.json({ success: true, data: result });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.id, readRefreshToken(req));
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await authService.me(req.user!.id) });
  }),
};

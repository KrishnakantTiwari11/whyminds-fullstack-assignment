import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { userService } from './user.service';

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await userService.list(req.query as never);
    res.json({ success: true, ...data });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await userService.getById(req.params.id) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await userService.create(req.body) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await userService.update(req.params.id, req.body) });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await userService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  }),
};

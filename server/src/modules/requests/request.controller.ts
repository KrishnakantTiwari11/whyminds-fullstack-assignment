import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requestService } from './request.service';

export const requestController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, ...(await requestService.list(req.user!, req.query as never)) });
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await requestService.stats(req.user!) });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await requestService.getById(req.user!, req.params.id) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await requestService.create(req.user!, req.body) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await requestService.update(req.user!, req.params.id, req.body) });
  }),

  decide: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await requestService.decide(req.user!, req.params.id, req.body) });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await requestService.remove(req.user!, req.params.id);
    res.status(204).send();
  }),
};

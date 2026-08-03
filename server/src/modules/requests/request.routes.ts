import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createRequestSchema,
  decisionSchema,
  idParamSchema,
  listRequestsQuerySchema,
  updateRequestSchema,
} from './request.schema';
import { requestController } from './request.controller';

export const requestRouter = Router();

requestRouter.use(authenticate);

requestRouter.get('/', validate({ query: listRequestsQuerySchema }), requestController.list);
requestRouter.get('/stats', requestController.stats);
requestRouter.get('/:id', validate({ params: idParamSchema }), requestController.getById);

requestRouter.post(
  '/',
  authorize(Role.REQUESTER, Role.ADMIN),
  validate({ body: createRequestSchema }),
  requestController.create,
);

requestRouter.patch(
  '/:id',
  authorize(Role.REQUESTER, Role.ADMIN),
  validate({ params: idParamSchema, body: updateRequestSchema }),
  requestController.update,
);

requestRouter.post(
  '/:id/decision',
  authorize(Role.APPROVER, Role.ADMIN),
  validate({ params: idParamSchema, body: decisionSchema }),
  requestController.decide,
);

requestRouter.delete(
  '/:id',
  authorize(Role.REQUESTER, Role.ADMIN),
  validate({ params: idParamSchema }),
  requestController.remove,
);

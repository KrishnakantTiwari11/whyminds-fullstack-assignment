import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createUserSchema, idParamSchema, listUsersQuerySchema, updateUserSchema } from './user.schema';
import { userController } from './user.controller';

export const userRouter = Router();

// Every user route is admin-only.
userRouter.use(authenticate, authorize(Role.ADMIN));

userRouter.get('/', validate({ query: listUsersQuerySchema }), userController.list);
userRouter.post('/', validate({ body: createUserSchema }), userController.create);
userRouter.get('/:id', validate({ params: idParamSchema }), userController.getById);
userRouter.patch('/:id', validate({ params: idParamSchema, body: updateUserSchema }), userController.update);
userRouter.delete('/:id', validate({ params: idParamSchema }), userController.remove);

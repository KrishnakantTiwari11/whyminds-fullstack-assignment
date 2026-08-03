import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { requestRouter } from './modules/requests/request.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ success: true, status: 'ok', uptime: process.uptime() }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/requests', requestRouter);

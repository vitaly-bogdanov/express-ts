import { Router } from 'express';
import { authHandler, authValidator } from './users.handlers/auth.handler';
import {
  updatePasswordHandler,
  updatePasswordValidator,
} from './users.handlers/update-password.handler';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const usersRouter = Router()
  .patch(
    '/users',
    authMiddleware,
    updatePasswordValidator,
    updatePasswordHandler,
  )
  .post('/users/auth', authValidator, authHandler);

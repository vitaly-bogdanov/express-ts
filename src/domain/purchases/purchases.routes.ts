import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createValidator,
  createHandler,
} from './purchases.handlers/create.handler';

export const purchasesRouter = Router().post(
  '/purchases',
  authMiddleware,
  createValidator,
  createHandler,
);

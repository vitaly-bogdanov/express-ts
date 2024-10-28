import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { getList } from './items.handlers/get-list.handler';
import { cacheMiddleware } from '../../middlewares/cache.middleware';

export const itemsRouter = Router().get(
  '/items',
  authMiddleware,
  cacheMiddleware,
  getList,
);

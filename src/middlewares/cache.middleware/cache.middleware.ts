import { Request, Response, NextFunction } from 'express';
import * as cacheService from '../../services/cache.service';

export async function cacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const key = req.originalUrl; // Используем URL запроса как ключ кэша
  const cachedData = await cacheService.getData(key);
  if (cachedData) {
    res.set('x-cache', 'HIT');
    const ttl = await cacheService.getTtl(key);
    res.set('x-cache-expire', ttl.toString());
    res.json(cachedData);
    return;
  }
  res.set('x-cache', 'MISS');
  next();
}

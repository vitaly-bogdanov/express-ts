import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { unprocessableEntity } from '../../wrappers/api-error.wrapper';

export function validator(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error: any = validationErrors.array()[0];
    return next(unprocessableEntity(`${error.path}: ${error.msg}`));
  }
  next();
}

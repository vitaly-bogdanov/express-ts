import jwt from 'jsonwebtoken';
import { getConfig } from '../config.wrapper';
import { ICastomJwtPayload } from './jwt.types';

export function getAccessToken(payload: { id: number; name: string }): string {
  const config = getConfig();
  return jwt.sign(payload as ICastomJwtPayload, config.JWT_SECRET, {
    expiresIn: config.EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): ICastomJwtPayload {
  const config = getConfig();
  return jwt.verify(token, config.JWT_SECRET) as ICastomJwtPayload;
}

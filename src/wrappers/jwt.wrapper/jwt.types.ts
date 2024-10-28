import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface ICastomJwtPayload extends JwtPayload {
  id: number;
  name: string;
}

export interface ICustomRequest extends Request {
  payload: ICastomJwtPayload;
}

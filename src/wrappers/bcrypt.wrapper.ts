import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

export function getHash(str: string): Promise<string> {
  return bcrypt.hash(str, salt);
}

export function compare(str: string, hash: string): Promise<boolean> {
  return bcrypt.compare(str, hash);
}

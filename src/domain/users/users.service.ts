import type { TUserSchema } from './users.types';
import { getConnection } from '../../services/some-db-name.service';

export async function getOneByName(name: string): Promise<TUserSchema | null> {
  const connection = getConnection();

  const result = await connection<TUserSchema[]>`
    SELECT id, password FROM users
    WHERE name = ${name};
  `;

  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

/**
 * Обновляет пароль
 */
export async function updatePasswordById(
  id: number,
  password: string,
): Promise<void> {
  const connection = getConnection();

  await connection`
    UPDATE users SET password = ${password} WHERE id = ${id};
  `;
}

/**
 * Обновляет токен
 */
export async function updateToken(
  id: number,
  token: string | null,
): Promise<void> {
  const connection = getConnection();

  await connection`
    UPDATE users SET token = ${token} WHERE id = ${id};
  `;
}

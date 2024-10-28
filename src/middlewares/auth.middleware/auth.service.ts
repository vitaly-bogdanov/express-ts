import { getConnection } from '../../services/some-db-name.service';

export async function getTokenById(id: number): Promise<string | null> {
  const connection = getConnection();

  const result = await connection`
    SELECT token FROM users
    WHERE id = ${id};
  `;

  if (result.length > 0) {
    return result[0].token;
  } else {
    return null;
  }
}

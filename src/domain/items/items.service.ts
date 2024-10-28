import { getConnection } from '../../services/some-db-name.service';

export async function getItemsList() {
  const connection = await getConnection();

  const [tradable, nonTradable] = await Promise.all([
    connection`
      SELECT * 
      FROM items
      WHERE quantity > 0
      ORDER BY suggested_price ASC
      LIMIT 1;
    `,
    connection`
      SELECT * 
      FROM items
      WHERE quantity = 0
      ORDER BY suggested_price ASC
      LIMIT 1;
    `,
  ]);

  return [...tradable, ...nonTradable];
}

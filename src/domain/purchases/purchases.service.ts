import { getConnection } from '../../services/some-db-name.service';
import { conflict } from '../../wrappers/api-error.wrapper';

export async function createPurchase(
  userId: number,
  items: { id: number; quantity: number }[],
): Promise<number> {
  const connection = await getConnection();

  await connection.begin(async (sql) => {
    const ids = items.map((item) => item.id);
    const itemRecords =
      await sql`SELECT id, suggested_price, quantity FROM items WHERE id = ANY(${sql.array(ids)}::int[])`;

    const sum = await items.reduce(async (memo: any, item: any) => {
      const itemRecord = itemRecords.find(
        (itemRecord) => item.id == itemRecord.id,
      );
      memo = await memo;
      if (!itemRecord) {
        throw Error('transaction error');
      }
      if (itemRecord?.quantity < item?.quantity) {
        throw Error('not available items for purchase');
      }
      memo += item.quantity * parseFloat(itemRecord.suggested_price);
      await sql`UPDATE items SET quantity = ${itemRecord.quantity - item.quantity} WHERE id = ${item.id};`;

      return memo;
    }, 0);

    const [user] = await sql`
      SELECT balance FROM users
      WHERE id = ${userId};
    `;

    user.balance = parseFloat(user.balance);

    if (user.balance < sum) {
      throw conflict('not enough funds in the account');
    }

    const [purchase] = await sql`
      INSERT INTO purchases (user_id, sum)
      VALUES (${userId}, ${sum}) RETURNING id
    `;

    await Promise.all(
      items.map(async (item) => {
        await sql`
        INSERT INTO purchase_items (purchase_id, item_id, quantity)
        VALUES (${purchase.id}, ${item.id}, ${item.quantity})
      `;
      }),
    );

    await connection`
      UPDATE users SET balance = ${user.balance - sum} WHERE id = ${userId};
    `;
  });

  const [user] = await connection`
    SELECT balance FROM users
    WHERE id = ${userId};
  `;

  return user.balance;
}

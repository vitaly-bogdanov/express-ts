import { connect, disconnect } from './some-db-name.service';
import { getHash } from '../../wrappers/bcrypt.wrapper';
import { init } from '../../wrappers/logger.wrapper';

const logger = init(__filename);

(async () => {
  const connection = connect();

  // users
  await connection`DELETE FROM users;`;

  await connection`
    INSERT INTO users (id, name, password, balance)
    VALUES (1, ${'UserName1'}, ${await getHash('password123')}, 1000)
  `;

  await connection`
    INSERT INTO users (id, name, password, balance)
    VALUES (2, ${'UserName2'}, ${await getHash('qwerty')}, 1500)
  `;

  // items
  await connection`DELETE FROM items;`;
  await connection`
    INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, min_price, max_price, mean_price, quantity)
    VALUES (1, ${'AK-47 | Aquamarine Revenge (Battle-Scarred)'}, ${10.1}, ${'https://skinport.com/item/csgo/ak-47-aquamarine-revenge-battle-scarred'}, ${'https://skinport.com/market/730?cat=Rifle&item=Aquamarine+Revenge'}, ${11.33}, ${18.22}, ${12.58}, ${25})
  `;

  await connection`
    INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, quantity)
    VALUES (2, ${'★ M9 Bayonet | Fade (Factory New)'}, ${10.1}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${10})
  `;

  // purchases
  await connection`DELETE FROM purchases;`;
  await connection`
    INSERT INTO purchases (id, user_id, sum)
    VALUES (1, 1, 30.30)
  `;

  // purchase_items
  await connection`DELETE FROM purchase_items;`;
  await connection`
    INSERT INTO purchase_items (purchase_id, item_id, quantity)
    VALUES (1, 1, 2)
  `;

  await connection`
    INSERT INTO purchase_items (purchase_id, item_id, quantity)
    VALUES (1, 2, 1)
  `;

  const users = await connection`SELECT COUNT(*) FROM users;`;
  const items = await connection`SELECT COUNT(*) FROM items;`;
  const purchases = await connection`SELECT COUNT(*) FROM purchases;`;
  const purchase_items = await connection`SELECT COUNT(*) FROM purchase_items;`;
  logger.info(`created users: ${users[0].count}`);
  logger.info(`created items: ${items[0].count}`);
  logger.info(`created purchases: ${purchases[0].count}`);
  logger.info(`created purchase_items: ${purchase_items[0].count}`);

  await disconnect();
})();

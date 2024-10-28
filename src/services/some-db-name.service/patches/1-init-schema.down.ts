import { connect, disconnect } from '../some-db-name.service';
import { init } from '../../../wrappers/logger.wrapper';

const logger = init(__filename);

(async () => {
  logger.info('schema down');

  const connection = connect();

  //
  // триггеры
  //

  await connection`
    DROP TRIGGER IF EXISTS tg_users_set_updated_at ON users;
  `;

  await connection`
    DROP TRIGGER IF EXISTS tg_items_set_updated_at ON items;
  `;

  await connection`
    DROP TRIGGER IF EXISTS tg_purchases_set_updated_at ON purchases;
  `;

  await connection`
    DROP TRIGGER IF EXISTS tg_purchase_items_set_updated_at ON purchase_items;
  `;

  //
  // функции
  //

  await connection`
    DROP FUNCTION IF EXISTS fn_update_updated_at_column;
  `;

  //
  // таблицы
  //

  await connection`
    DROP TABLE IF EXISTS users CASCADE;
  `;

  await connection`
    DROP TABLE IF EXISTS purchases CASCADE;
  `;

  await connection`
    DROP TABLE IF EXISTS items CASCADE;
  `;

  await connection`
    DROP TABLE IF EXISTS purchase_items CASCADE;
  `;

  await disconnect();
  logger.info('success');
})();

import { connect, disconnect } from '../some-db-name.service';
import { init } from '../../../wrappers/logger.wrapper';

const logger = init(__filename);

(async () => {
  logger.info('schema up');

  const connection = connect();

  //
  // таблицы
  //

  // users
  await connection`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      balance DECIMAL(10, 2) DEFAULT 0.00,
      currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
      name VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      token TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await connection`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      user_id INT,
      sum DECIMAL(10, 2) NOT NULL,
      purchase_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await connection`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      market_hash_name VARCHAR(255) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
      suggested_price DECIMAL(10, 2) NOT NULL,
      item_page VARCHAR(255) NOT NULL,
      market_page VARCHAR(255),
      min_price DECIMAL(10, 2) DEFAULT NULL,
      max_price DECIMAL(10, 2) DEFAULT NULL,
      mean_price DECIMAL(10, 2) DEFAULT NULL,
      quantity INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await connection`
    CREATE TABLE IF NOT EXISTS purchase_items (
      purchase_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      PRIMARY KEY (purchase_id, item_id)
    );
  `;

  //
  // функции
  //

  // обновление поля updated_at
  await connection`
    CREATE OR REPLACE FUNCTION fn_update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  //
  // триггеры
  //

  // обновление users.updated_at, при изменении любого поля
  await connection`
    CREATE OR REPLACE TRIGGER tg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at_column();
  `;

  // обновление purchases.updated_at, при изменении любого поля
  await connection`
    CREATE OR REPLACE TRIGGER tg_purchases_set_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at_column();
  `;

  // обновление items.updated_at, при изменении любого поля
  await connection`
    CREATE OR REPLACE TRIGGER tg_items_set_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at_column();
  `;

  // обновление purchase_items.updated_at, при изменении любого поля
  await connection`
    CREATE OR REPLACE TRIGGER tg_purchase_items_set_updated_at
    BEFORE UPDATE ON purchase_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at_column();
  `;

  await disconnect();

  logger.info('success');
})();

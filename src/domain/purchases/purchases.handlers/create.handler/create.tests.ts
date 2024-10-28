import request from 'supertest';
import { getConfig } from '../../../../wrappers/config.wrapper';
import { createApp } from '../../../../wrappers/express-app.wrapper';
import { httpCodes } from '../../../../constants';
import {
  connect,
  getConnection,
  disconnect,
} from '../../../../services/some-db-name.service';
import { getHash } from '../../../../wrappers/bcrypt.wrapper';
import { getAccessToken } from '../../../../wrappers/jwt.wrapper';
import * as purchasesService from '../../purchases.service';

describe('testing POST /purchases', () => {
  const config = getConfig();
  const app = createApp();

  const token = getAccessToken({ id: 1, name: 'TestName7' });

  beforeAll(async () => {
    const connection = connect();

    await Promise.all([
      connection`
        INSERT INTO users (id, name, password, balance, token)
        VALUES (1, ${'TestName7'}, ${await getHash('password123')}, 1100, ${token})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, min_price, max_price, mean_price, quantity)
        VALUES (1, ${'AK-47 | Aquamarine Revenge (Battle-Scarred)'}, ${10.1}, ${'https://skinport.com/item/csgo/ak-47-aquamarine-revenge-battle-scarred'}, ${'https://skinport.com/market/730?cat=Rifle&item=Aquamarine+Revenge'}, ${11.33}, ${18.22}, ${12.58}, ${25})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, quantity)
        VALUES (2, ${'★ M9 Bayonet | Fade (Factory New)'}, ${10.1}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${10})
      `,
    ]);
  });

  afterAll(async () => {
    const connection = getConnection();

    await Promise.all([
      connection`TRUNCATE TABLE users CASCADE;`,
      connection`TRUNCATE TABLE items CASCADE;`,
      connection`TRUNCATE TABLE purchases CASCADE;`,
      connection`TRUNCATE TABLE purchase_items CASCADE;`,
    ]);

    await disconnect();

    jest.clearAllMocks();
  });

  test('success', async () => {
    const connection = getConnection();

    const [beforeUser] = await connection`
      SELECT id, balance FROM users
      WHERE id = ${1};
    `;

    const [beforeItem1] = await connection`
      SELECT id, suggested_price, quantity FROM items
      WHERE id = ${1};
    `;

    const [beforeItem2] = await connection`
      SELECT id, suggested_price, quantity FROM items
      WHERE id = ${2};
    `;

    expect(beforeUser.balance).toBe('1100.00');
    expect(beforeItem1.quantity).toBe(25);
    expect(beforeItem2.quantity).toBe(10);

    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/purchases`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        items: [
          {
            id: 1,
            quantity: 2,
          },
          {
            id: 2,
            quantity: 1,
          },
        ],
      });

    const [afterUser] = await connection`
      SELECT id, balance FROM users
      WHERE id = ${1};
    `;

    const [afterItem1] = await connection`
      SELECT id, suggested_price, quantity FROM items
      WHERE id = ${1};
    `;

    const [afterItem2] = await connection`
      SELECT id, suggested_price, quantity FROM items
      WHERE id = ${2};
    `;

    expect(afterItem1.quantity).toBe(23);
    expect(afterItem2.quantity).toBe(9);
    expect(afterUser.balance).toBe('1069.70');

    expect(status).toBe(httpCodes.CREATED);
    expect(body).toEqual({ balance: '1069.70' });
  });

  describe('validation errors', () => {
    test('error: items required field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({});

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items: required field' });
    });

    test('error: items invalid value', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({ items: 1 });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items: invalid value' });
    });

    test('error: items.*.quantity required field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          items: [{ id: 1 }],
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items[0].quantity: required field' });
    });

    test('error: items.*.quantity invalid field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          items: [{ id: 1, quantity: 'invalid' }],
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items[0].quantity: invalid field' });
    });

    test('error: items.*.id required field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          items: [{ quantity: 80 }],
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items[0].id: required field' });
    });

    test('error: items.*.id invalid field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/purchases`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          items: [{ id: 'invalid', quantity: 80 }],
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({ message: 'items[0].id: invalid field' });
    });
  });

  test('error: internal', async () => {
    jest
      .spyOn(purchasesService, 'createPurchase')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/purchases`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        items: [{ id: 1, quantity: 80 }],
      });

    expect(status).toBe(httpCodes.INTERNAL_ERROR);
    expect(body).toEqual({
      message: 'Internal unexpected server error',
    });
  });
});

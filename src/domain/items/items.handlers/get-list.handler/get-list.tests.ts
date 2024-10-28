import request from 'supertest';
import _ from 'lodash';
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
import * as cacheService from '../../../../services/cache.service';

describe('testing GET /items', () => {
  const config = getConfig();
  const app = createApp();

  const token = getAccessToken({ id: 1, name: 'TestName3' });

  beforeAll(async () => {
    await cacheService.connect();
    const connection = connect();

    await Promise.all([
      connection`
        INSERT INTO users (id, name, password, balance, token)
        VALUES (1, ${'TestName3'}, ${await getHash('password123')}, 1100, ${token})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, min_price, max_price, mean_price, quantity)
        VALUES (1, ${'AK-47 | Aquamarine Revenge (Battle-Scarred)'}, ${109.1}, ${'https://skinport.com/item/csgo/ak-47-aquamarine-revenge-battle-scarred'}, ${'https://skinport.com/market/730?cat=Rifle&item=Aquamarine+Revenge'}, ${11.33}, ${18.22}, ${12.58}, ${25})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, min_price, max_price, mean_price, quantity)
        VALUES (2, ${'★ M9 Bayonet | Fade (Factory New)'}, ${1.1}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${11.33}, ${18.22}, ${12.58}, ${10})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, quantity)
        VALUES (3, ${'★ M9 Bayonet | Fade (Factory New)'}, ${100.0}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${0})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, quantity)
        VALUES (4, ${'★ M9 Bayonet | Fade (Factory New)'}, ${19.1}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${0})
      `,
      connection`
        INSERT INTO items (id, market_hash_name, suggested_price, item_page, market_page, quantity)
        VALUES (5, ${'★ M9 Bayonet | Fade (Factory New)'}, ${10.1}, ${'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new'}, ${'https://skinport.com/market/730?cat=Knife&item=Fade'}, ${0})
      `,
    ]);
  });

  afterAll(async () => {
    const connection = getConnection();

    await Promise.all([
      await connection`TRUNCATE TABLE users CASCADE;`,
      await connection`TRUNCATE TABLE items CASCADE;`,
    ]);

    await disconnect();
    await cacheService.clear();
    await cacheService.disconnect();

    jest.clearAllMocks();
  });

  test('success', async () => {
    const { status, body, headers } = await request(app)
      .get(`/${config.PREFIX}/items`)
      .set({ Authorization: `Bearer ${token}` });

    expect(status).toBe(httpCodes.OK);
    expect(_.omit(body[0], ['created_at', 'updated_at'])).toEqual({
      currency: 'EUR',
      id: 2,
      item_page: 'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new',
      market_hash_name: '★ M9 Bayonet | Fade (Factory New)',
      market_page: 'https://skinport.com/market/730?cat=Knife&item=Fade',
      max_price: '18.22',
      mean_price: '12.58',
      min_price: '11.33',
      quantity: 10,
      suggested_price: '1.10',
    });
    expect(_.omit(body[1], ['created_at', 'updated_at'])).toEqual({
      currency: 'EUR',
      id: 5,
      item_page: 'https://skinport.com/item/csgo/m9-bayonet-fade-factory-new',
      market_hash_name: '★ M9 Bayonet | Fade (Factory New)',
      market_page: 'https://skinport.com/market/730?cat=Knife&item=Fade',
      max_price: null,
      mean_price: null,
      min_price: null,
      quantity: 0,
      suggested_price: '10.10',
    });

    // получили данные в первом запросе не из кеша
    expect(headers['x-cache']).toBe('MISS');

    const cachedResponse = await request(app)
      .get(`/${config.PREFIX}/items`)
      .set({ Authorization: `Bearer ${token}` });

    // плучили данные из кеша во втором запросе
    expect(cachedResponse.headers['x-cache']).toBe('HIT');
    expect(cachedResponse.headers['x-cache-expire']).toBe('60');
  });
});

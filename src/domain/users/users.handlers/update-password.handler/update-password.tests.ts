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
import { getAccessToken } from '../.././../../wrappers/jwt.wrapper';
import * as usersService from '../../users.service';
import { PASSWORD_LENGTH } from '../../users.constants';

describe('testing PATCH /users', () => {
  const config = getConfig();
  const app = createApp();

  beforeAll(async () => {
    const connection = connect();
    await connection`
      INSERT INTO users (id, name, password, balance, token)
      VALUES (1, ${'TestName1'}, ${await getHash('password123')}, 1100, ${getAccessToken({ id: 1, name: 'TestName1' })})
    `;
    await connection`
      INSERT INTO users (id, name, password, balance, token)
      VALUES (2, ${'TestName2'}, ${await getHash('password123')}, 1100, ${getAccessToken({ id: 2, name: 'TestName2' })})
    `;
  });

  afterAll(async () => {
    const connection = getConnection();

    await connection`TRUNCATE TABLE users CASCADE;`;

    await disconnect();
    jest.clearAllMocks();
  });

  test('success', async () => {
    const connection = getConnection();

    const [beforeUser] = await connection`
      SELECT id, name, password, token FROM users
      WHERE name = ${'TestName1'};
    `;

    // меняем пароль
    const response1 = await request(app)
      .patch(`/${config.PREFIX}/users`)
      .set({ Authorization: `Bearer ${beforeUser.token}` })
      .send({
        oldPassword: 'password123',
        newPassword: 'newPassword',
      });

    const [afterUser] = await connection`
      SELECT id, name, password, token FROM users
      WHERE name = ${'TestName1'};
    `;

    expect(beforeUser.id).toBe(afterUser.id);
    expect(beforeUser.name).toBe(afterUser.name);
    expect(beforeUser.password).not.toBe(afterUser.password);
    expect(afterUser.token).toBe(null);

    expect(response1.status).toBe(httpCodes.NO_CONTENT);
    expect(response1.body).toEqual({});

    // проверяем произошла ли деавторизация
    const response2 = await request(app)
      .patch(`/${config.PREFIX}/users`)
      .set({ Authorization: `Bearer ${beforeUser.token}` })
      .send({
        oldPassword: 'newPassword',
        newPassword: 'password123',
      });

    expect(response2.status).toBe(httpCodes.UNAUTHORIZED);
    expect(response2.body).toEqual({
      message: 'token expired or invalid, please refresh your token',
    });
  });

  describe('validation errors', () => {
    test(`error: newPassword length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`, async () => {
      const connection = getConnection();

      const [user] = await connection`
      SELECT id, token FROM users
      WHERE name = ${'TestName2'};
    `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({
          oldPassword: 'password123',
          newPassword: 'n',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: `newPassword: length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`,
      });
    });

    test(`error: oldPassword length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`, async () => {
      const connection = getConnection();

      const [user] = await connection`
        SELECT id, token FROM users
        WHERE name = ${'TestName2'};
      `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({
          oldPassword: 'n',
          newPassword: 'password123',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: `oldPassword: length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`,
      });
    });

    test('error: newPassword required field', async () => {
      const connection = getConnection();

      const [user] = await connection`
        SELECT id, token FROM users
        WHERE name = ${'TestName2'};
      `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({ oldPassword: 'newPassword' });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'newPassword: required field',
      });
    });

    test('error: oldPassword required field', async () => {
      const connection = getConnection();

      const [user] = await connection`
        SELECT id, token FROM users
        WHERE name = ${'TestName2'};
      `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({ newPassword: 'newPassword' });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'oldPassword: required field',
      });
    });

    test('error: newPassword invalid type', async () => {
      const connection = getConnection();

      const [user] = await connection`
        SELECT id, token FROM users
        WHERE name = ${'TestName2'};
      `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({
          oldPassword: 'newPassword',
          newPassword: 123,
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'newPassword: invalid type',
      });
    });

    test('error: oldPassword invalid type', async () => {
      const connection = getConnection();

      const [user] = await connection`
        SELECT id, token FROM users
        WHERE name = ${'TestName2'};
      `;

      const { status, body } = await request(app)
        .patch(`/${config.PREFIX}/users`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send({
          oldPassword: 123,
          newPassword: 'password123',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'oldPassword: invalid type',
      });
    });
  });

  test('error: internal', async () => {
    jest.spyOn(usersService, 'getOneByName').mockImplementationOnce(() => {
      throw new Error();
    });

    const connection = getConnection();

    const [user] = await connection`
      SELECT id, token FROM users
      WHERE name = ${'TestName2'};
    `;

    const { status, body } = await request(app)
      .patch(`/${config.PREFIX}/users`)
      .set({ Authorization: `Bearer ${user.token}` })
      .send({
        oldPassword: 'password123',
        newPassword: 'newPassword',
      });

    expect(status).toBe(httpCodes.INTERNAL_ERROR);
    expect(body).toEqual({
      message: 'Internal unexpected server error',
    });
  });
});

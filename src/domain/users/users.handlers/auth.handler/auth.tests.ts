import request from 'supertest';
import { PASSWORD_LENGTH, NAME_LENGTH } from '../../users.constants';
import { getConfig } from '../../../../wrappers/config.wrapper';
import { createApp } from '../../../../wrappers/express-app.wrapper';
import { httpCodes } from '../../../../constants';
import {
  connect,
  getConnection,
  disconnect,
} from '../../../../services/some-db-name.service';
import { getHash } from '../../../../wrappers/bcrypt.wrapper';
import * as usersService from '../../users.service';

describe('testing POST /users/auth', () => {
  const config = getConfig();
  const app = createApp();

  beforeAll(async () => {
    const connection = connect();

    await connection`
      INSERT INTO users (name, password, balance)
      VALUES (${'TestName1'}, ${await getHash('password123')}, 1100)
    `;

    await connection`
      INSERT INTO users (name, password, balance)
      VALUES (${'TestName2'}, ${await getHash('qwerty')}, 1200)
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
      SELECT token FROM users
      WHERE name = ${'TestName1'};
    `;
    expect(beforeUser.token).toBe(null);

    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/users/auth`)
      .send({
        name: 'TestName1',
        password: 'password123',
      });

    const [aftereUser] = await connection`
      SELECT token FROM users
      WHERE name = ${'TestName1'};
    `;
    expect(aftereUser.token).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');

    expect(status).toBe(httpCodes.OK);
    expect(body.refreshToken).toBe('none');
    expect(body.accessToken).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');
  });

  test('error: invalid name', async () => {
    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/users/auth`)
      .send({
        name: 'InvalidName',
        password: 'password123',
      });

    expect(status).toBe(httpCodes.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'invalid username or invalid password',
    });
  });

  test('error: invalid password', async () => {
    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/users/auth`)
      .send({
        name: 'TestName2',
        password: 'password123',
      });

    expect(status).toBe(httpCodes.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'invalid username or invalid password',
    });
  });

  describe('validation errors', () => {
    test('error: password required field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          name: 'Name',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'password: required field',
      });
    });

    test('error: password invalid type', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          name: 'Name',
          password: 123214,
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'password: invalid type',
      });
    });

    test(`error: password length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`, async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          name: 'Name',
          password: 'sa',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: `password: length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`,
      });
    });

    test('error: name required field', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          password: 'qwerty',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'name: required field',
      });
    });

    test('error: name invalid type', async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          password: 'qwerty',
          name: 12345,
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'name: invalid type',
      });
    });

    test(`error: name length should be from ${NAME_LENGTH.MIN} to ${NAME_LENGTH.MAX} characters`, async () => {
      const { status, body } = await request(app)
        .post(`/${config.PREFIX}/users/auth`)
        .send({
          password: 'qwerty',
          name: 'w',
        });

      expect(status).toBe(httpCodes.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        message: 'name: length should be from 2 to 20 characters',
      });
    });
  });

  test('error: internal', async () => {
    jest.spyOn(usersService, 'getOneByName').mockImplementationOnce(() => {
      throw new Error();
    });

    const { status, body } = await request(app)
      .post(`/${config.PREFIX}/users/auth`)
      .send({
        name: 'TestName1',
        password: 'password123',
      });

    expect(status).toBe(httpCodes.INTERNAL_ERROR);
    expect(body).toEqual({
      message: 'Internal unexpected server error',
    });
  });
});

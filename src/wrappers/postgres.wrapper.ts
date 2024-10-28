import postgres, { Sql } from 'postgres';

export class Postres {
  private sql: Sql;

  constructor(
    host: string,
    port: number,
    database: string,
    username: string,
    password: string,
  ) {
    this.sql = postgres({ host, port, database, username, password });
  }

  async disconnect(): Promise<void> {
    await this.sql.end();
  }

  get connection(): Sql {
    return this.sql;
  }
}

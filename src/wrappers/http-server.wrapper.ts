import { Express } from 'express';
import { createServer, Server } from 'node:http';
import { init } from './logger.wrapper';

const logger = init(__filename);

export class HttpServer {
  protected server: Server;

  constructor(
    app: Express,
    public hostname: string,
    public port: number,
  ) {
    this.server = createServer(app);
  }

  start() {
    this.server.listen(this.port || 3000, this.hostname || 'localhost', () => {
      logger.info(`http server has been started on port ${this.port}...`);
    });
  }
}

import { Request, Response, NextFunction } from 'express';
import { init } from '../../wrappers/logger.wrapper';
import { ApiError, internalError } from '../../wrappers/api-error.wrapper';

const logger = init(__filename);

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err) {
    logger.error(err.message);
    if (err instanceof ApiError) {
      res.status(err.httpCode).send({
        message: err.message,
      });
    } else {
      const internalErr: ApiError = internalError();
      res.status(internalErr.httpCode).send({
        message: internalErr.message,
      });
    }
  } else {
    next();
  }
}

// const {
//   ApiError,
//   InternalError,
//   BadRequest,
// } = require("../../constants/errors");

// const errorsHandler = [
//   (err, req, res, next) => {
//     if (err) {
//       logger.error(err);
//       if (!(err instanceof ApiError)) {
//         if (err.type === "entity.parse.failed") {
//           throw new BadRequest();
//         }
//         throw new InternalError();
//       }
//       throw err;
//     } else {
//       next();
//     }
//   },
//   (err, req, res, next) => {
//     const httpCode = err.http_code;
//     const respCode = err.error_code;
//     const respErrMessage = err.message;
//     logger.error(
//       `Request finished with code "${httpCode}" error "${respCode}"`
//     );
//     res.header("Content-Type", "application/json");
//     res.status(httpCode).send({
//       code: respCode,
//       message: respErrMessage,
//     });
//   },
// ];

// module.exports = { errorsHandler };

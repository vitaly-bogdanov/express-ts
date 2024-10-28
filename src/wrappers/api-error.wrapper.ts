import { httpCodes } from '../constants/http-codes';

export class ApiError extends Error {
  constructor(
    public httpCode: number,
    public message: string,
  ) {
    super();
  }
}

export function badRequest(message?: string): ApiError {
  return new ApiError(
    httpCodes.BAD_REQUEST,
    message || 'Malformed request syntax',
  );
}

export function unauthorized(message?: string): ApiError {
  return new ApiError(
    httpCodes.UNAUTHORIZED,
    message || 'Unauthorized request',
  );
}

export function forbidden(message?: string): ApiError {
  return new ApiError(
    httpCodes.FORBIDDEN,
    message || 'Not enough permission to access this resource',
  );
}

export function notFound(message?: string): ApiError {
  return new ApiError(
    httpCodes.NOT_FOUND,
    message || "The requested entity is unavailable or doesn't exist",
  );
}

export function conflict(message?: string): ApiError {
  return new ApiError(
    httpCodes.CONFLICT,
    message ||
      'The request could not be processed because of conflict in the current state',
  );
}

export function unprocessableEntity(message?: string) {
  return new ApiError(
    httpCodes.UNPROCESSABLE_ENTITY,
    message || 'Illegal request params values',
  );
}

export function internalError(message?: string): ApiError {
  return new ApiError(
    httpCodes.INTERNAL_ERROR,
    message || 'Internal unexpected server error',
  );
}

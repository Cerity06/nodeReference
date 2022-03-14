import { NextFunction, Request, Response } from 'express';
import { CatchFN } from '../types';

interface HandleError extends AppError {
  path: string;
  value: string;
  code: number;
  errmsg: string;
}

export class AppError extends global.Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    //error: err, // general information about the error
    //stack: err.stack, // show where the error occurred
  });
};

const SendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming error or other unknown error: don't leak error details to user
  } else {
    // 1- Log Error
    console.error('ERROR', err);
    // 2- Send Generic message
    res
      .status(500)
      .json({ status: 'Unknown Error!', message: 'Something went very wrong!' });
  }
};
// CastError => if wrong id are inserted
const handleCastError = (err: HandleError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = (err: HandleError) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${
    value ? value[0] : 'unknown'
  }. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err: HandleError) => {
  const message = `Invalid input data`;
  return new AppError(message, 400);
};

export const globalErrorHandler = (
  err: HandleError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errorObj = { ...err };
    if (errorObj.name === 'CastError') handleCastError(errorObj);
    if (errorObj.code === 11000) handleDuplicateError(errorObj);
    if (errorObj.name === 'ValidationError') handleValidationError(errorObj);

    SendErrorProd(err, res);
  }
};

// create an anonymous function to try/catch
export const catchAsync = (fn: CatchFN) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

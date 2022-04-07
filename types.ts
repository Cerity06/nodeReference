import { NextFunction, Request, Response } from 'express';
import { Document } from 'mongoose';

export type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  ip_address?: string;
  createdAt?: Date;
  slug?: string;
};

export interface ResponseError extends Error {
  statusCode?: number;
  status?: string;
}

export type CatchFN = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | NextFunction>;

export type ErrorData = {
  status: string;
  message: string;
  error?: Error;
  stack?: string;
};

export interface IUserDocument extends Document {
  name: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passwordConfirmed: string;
  passwordResettoken: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordChangedAt: Date;
}
export interface MemberDocument extends IUserDocument {
  checkPassword: (password: string) => Promise<boolean>;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  resetPassword: () => string;
}

export interface RequestUser extends Request {
  user: MemberDocument;
}

export type OptionsType = {
  email: string;
  subject: string;
  message: string;
  html?: string;
};

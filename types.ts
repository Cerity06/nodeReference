import { NextFunction, Request, Response } from 'express';

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

export type Catch = (req: Request, res: Response, next: NextFunction) => any;

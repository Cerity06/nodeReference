import { NextFunction, Request, Response } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const url = req.url;
  const time = new Date().getFullYear;
  console.log(`method called is ${method}, route: ${url}, on ${time}`);
  next();
};

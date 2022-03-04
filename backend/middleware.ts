import { NextFunction, Request, Response } from 'express';
const express = require('express');

const app = express();

const logger = (req: Request, res: Response, next: NextFunction) => {
  const date = new Date().toISOString();
  console.log(`log to page user at ${date}`);
  next();
};

// LOADING MIDDLEWARE
app.use(logger);

// handling error in the middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;

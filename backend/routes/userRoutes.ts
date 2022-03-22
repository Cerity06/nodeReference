import {
  getAllUsers,
  getUser,
  getGender,
  createUser,
  updateUser,
  deleteUser,
  aliasTopUsers,
  importAllData,
} from '../controllers/userController';
import { logger } from '../controllers/middleware';
import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { AppError, globalErrorHandler } from '../../utils/appError';

const app = express();

// Middleware to check if operationnal errors and manage them
// can also be a [] of middleware functions as parameter.
app.use(globalErrorHandler);

// applied for everything related to /api routes
app.use('/api', logger);

app.route('/').get(getAllUsers).post(createUser);

// this is why it is "req.params.id" => call variable parameter related to the route
app.route('/:first_name').get(getUser).patch(updateUser).delete(deleteUser);

app.route('/query').get(getGender);

// Using middleware to select special users through the route
// prefill the query string object
app.route('/top-5-user').get(aliasTopUsers, getAllUsers);
app.route('/import-data').post(importAllData);

// To handle all other routes that are not managed by the other normal routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // next with parameter error => to error handling middleware
});

export default app;

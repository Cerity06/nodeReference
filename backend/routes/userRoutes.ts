import {
  getAllUsers,
  getUser,
  logger,
  checkServer,
  createUser,
  updateUser,
  deleteUser,
  aliasTopUsers,
} from '../controllers/userController';
import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { ResponseError } from '../../types';
import { AppError, middlewareErrorHandler } from '../../utils/appError';

const app = express();

app.use(logger);

app.get('/', getAllUsers);

// this is why it is "req.params.id" => call variable parameter related to the route
app.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// Using middleware to select special users through the route
// prefill the query string object
app.route('/top-5-user').get(aliasTopUsers, getAllUsers);

app.post('/api/v1/user', createUser);

app.use(checkServer);

// To handle all other routes that are note managed by the other normal routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Middleware to check if operationnal errors and manage them
app.use(middlewareErrorHandler);

export default app;

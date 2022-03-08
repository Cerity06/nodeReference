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
import express from 'express';

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

export default app;

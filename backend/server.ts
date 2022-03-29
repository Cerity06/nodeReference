import mongoose from 'mongoose';
import { port } from './../helpers/process';
import app from './routes/userRoutes';
import { database } from '../helpers/process';

mongoose
  .connect(database)
  .then(() => console.log('connection successful to DB'))
  .catch((err) => {
    throw new Error(err);
  });

const server = app.listen(+port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = app;

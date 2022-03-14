import mongoose from 'mongoose';
import { port } from './../helpers/process';
import app from './routes/userRoutes';
import { database } from '../helpers/process';

// Here need to terminate the server because it becomes unclean
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION * SHUTTING DOWN...');
  console.log(err.name, err.message);
  process.exit(1);
});

mongoose.connect(database).then(() => console.log('connection successful to DB'));

const server = app.listen(+port, () => {
  console.log(`Server running on port: ${port}`);
});

//process.on('unhandledRejection', (err: Error) => {
//  console.log('UNHANDLED REJECTION * SHUTTING DOWN...');
//  console.log(err.name, err.message);
//  server.close(() => {
//    process.exit(1);
//  });
//});

module.exports = app;

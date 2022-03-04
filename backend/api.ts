import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const app = require('./middleware');

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  ip_address: string;
};

// TOP LEVEL CODE (read once)
const res = fs.readFileSync(
  path.join(process.cwd(), '/data/data.json'),
  'utf-8'
);
const data: User[] = JSON.parse(res.toString());

// Functions used in routes
const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  console.log('Request received for all users');
  res.status(200).json({ message: 'success', data: data });
};

const getUserData = (req: Request, res: Response) => {
  const userId = req.params.id;
  const userData = data.filter((user) => {
    return user.id.toString() === userId;
  });
  if (userData.length > 0) {
    res.status(200).json({ message: 'success', data: userData });
  } else {
    res
      .status(404)
      .json({ message: 'fail', data: 'no data found for this user' });
  }
};

// ROUTING
app.route('/').get(getAllUsers);
app.get('/:id?', getUserData);

module.exports = app;

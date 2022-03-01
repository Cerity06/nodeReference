import { Request, Response } from 'express';

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());

// TOP level code here
const res: JSON = fs.readFileSync(
  path.join(__dirname, '/data/data.json'),
  'utf8'
);
const data: string = JSON.parse(res.toString());
console.log(data);

const getUserData = (req: Request, res: Response) => {
  res.status(200).json({ message: 'success', data: data });
};

const router = express.Router();
app.use('/api/users', router);

app.router('/').get(getUserData);

import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import express from 'express';

const app = express();

// TOP LEVEL CODE (read once)
const res = fs.readFileSync(
  path.join(process.cwd(), '/data/data.json'),
  'utf-8'
);
const data: string = JSON.parse(res.toString());

// Functions
const getUserData = (req: Request, res: Response) => {
  res.status(200).json({ message: 'success', data: data });
};

// ROUTING WITH APP
app.use(express.json());

app.get('/', getUserData);

module.exports = app;

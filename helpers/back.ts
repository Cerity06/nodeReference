import fs from 'fs';
import path from 'path';
import { UserType } from '../types';

// TOP LEVEL CODE (read once)
const res = fs.readFileSync(path.join(process.cwd(), '/data/data.json'), 'utf-8');

const data: UserType[] = JSON.parse(res.toString());

export default data;

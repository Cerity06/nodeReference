import dotenv from 'dotenv';

// Only need to be run here for process to be available everywhere
dotenv.config({
  path: './config.env',
});

export const port = process.env.PORT ?? 3000;
export const database = process.env.DATABASE ?? '';

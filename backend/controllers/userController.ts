import { NextFunction, Request, Response } from 'express';
import { UserType } from '../../types';
import data from '../../helpers/back';
import User from '../models/userModel';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const date = new Date().toISOString();
  console.log(`log to page user at ${date}`);
  next();
};

// Functions used in routes
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    console.log('Request received for all users');
    const users = await User.find();
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    res.status(404).json({ status: 'success', message: 'Users not found!' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = await User.findById(userId); // shorthand for User.findOne({ _id: req.params.id})
    res.status(200).json({ status: 'success', data: userData });
  } catch (err) {
    res.status(404).json({ status: 'fail', data: 'no data found for this user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  if (req.method !== 'POST' && !req.body) {
    return;
  }
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: 'success', data: newUser });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'error! Bad Request!' });
  }
};

// PATCH Method - PUT method would replace the data instead of updating it
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userUpdated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // for validation in Schema, need to be set to true
    });
    res.status(200).json({ status: 'success', data: userUpdated });
  } catch (err) {
    res.status(404).json({ status: 'fail', data: 'no data found for this user' });
  }
};

// Common practice not to send back any data when deletion
// 204 is also a standard for delete operation
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', data: err });
  }
};

export const checkServer = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
};

export const aliasTopUsers = (req: Request, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

// Aggregation pipeline to search data
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$raingAverage' },
          avgPrice: { $avg: '$Price' },
          minPrice: { $min: '$Price' },
          maxPrice: { $max: '$Price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      {
        $match: { _id: { $ne: '$easy' } },
      },
    ]);
  } catch (err) {
    res.status(404).json({ status: 'fail', data: err });
  }
};
// route is '/monthlyplan:year'
const getMonthlyPlan = async (req: Request, res: Response) => {
  try {
    const year = +req.params.year;
    const plan = await User.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numUserStarts: { $sum: 1 },
          users: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numUserStarts: -1 }, // is for DESC order
      },
    ]);
    res.status(200).json({ status: 'success', data: plan });
  } catch (err) {
    res.status(404).json({ status: 'fail', data: err });
  }
};

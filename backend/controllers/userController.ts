import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { catchAsync, AppError } from '../../utils/appError';

// Functions used in routes
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Request received for all users');
    const users = await User.find();
    res.status(200).json({ status: 'success', data: users });
  }
);

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;

  if (!userId) return next(new AppError('No user found with that ID', 404));

  const userData = await User.findById(userId); // shorthand for User.findOne({ _id: req.params.id})
  res.status(200).json({ status: 'success', data: userData });
};

export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: 'success', data: newUser });
  }
);

// PATCH Method - PUT method would replace the data instead of updating it
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userUpdated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // for validation in Schema, need to be set to true
    });
    res.status(200).json({ status: 'success', data: userUpdated });
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = await User.findByIdAndRemove(req.params.id);

    if (!userId) return next(new AppError('No user found with that ID', 404));

    res.status(204).json({ status: 'success', data: null }); // Common practice not to send back any data when deletion
    // 204 is also a standard for delete operation
  }
);

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

import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { catchAsync, AppError } from '../../utils/appError';
import data from '../../helpers/back';

// Functions used in routes
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Request received for all users');
    const users = await User.find();
    res.status(200).json({ status: 'success', data: users });
  }
);

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const userData = await User.findOne({ first_name: req.params.first_name }); // shorthand for User.findOne({ _id: req.params.id})
  if (userData) {
    res.status(200).json({ status: 'success', data: userData });
    return;
  } else {
    next();
  }
};

export const getSex = async (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    const { filterType } = req.query;
    const listUsers = await User.find({ gender: filterType });
    res.status(200).json({ status: 'success', data: listUsers });
    return;
  } else {
    res
      .status(404)
      .json({ status: 'fail', message: 'No user of this type found! Please retry!' });
    return;
  }
};

export const importAllData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    data.map((user) => {
      User.create(user);
    });
    res.status(200).json({ status: 'success', message: 'Data successfully loaded!' });
  }
);

// POST METHOD
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = {
    id: 96,
    first_name: 'Roberta',
    last_name: 'Girard',
    email: 'robertagirard@creativecommons.org',
    gender: 'Female',
    ip_address: '170.47.153.38',
  };
  try {
    await User.create(user);
    // 201 is classic for creating data => POST methods
    res.status(201).json({ status: 'success', message: user });
    return;
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
    return;
  }
};

// PATCH Method - PUT method would replace the data instead of updating it
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const userUpdated = await User.findByIdAndUpdate(req.params.first_name, req.body, {
    new: true, // return the document after update was applied
    runValidators: true, // for validation in Schema, need to be set to true
  });
  res.status(200).json({ status: 'success', data: userUpdated });
});

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = await User.findByIdAndRemove(req.params.first_name);
    // 204 is also a standard for deletion operation
    res.status(204).json({ status: 'success', data: null }); // Common practice not to send back any data when deletion
  } catch (err) {
    res.status(404).json({ status: 'fail', message: 'No user found with that name' });
  }
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
export const getMonthlyPlan = async (req: Request, res: Response) => {
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

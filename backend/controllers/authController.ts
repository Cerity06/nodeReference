import { NextFunction, Request, Response } from 'express';
import Member from '../models/MemberModel';
import { MemberDocument } from '../../types';
import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET ?? 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newMember: MemberDocument = await Member.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmed: req.body.passwordConfirmed,
    });

    const token = signToken(newMember._id);

    res.status(201).json({
      status: 'success',
      message: 'Member created successfully',
      token,
      data: newMember,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: MemberDocument = req.body;

    const user = await Member.findOne({ email });

    if (!user || (await user.checkPassword(password))) {
      return res.status(401).json({ status: 'unauthorized' });
    }

    res.status(200).json({ status: 'success', message: 'connected!' });
  } catch (err) {
    return next(err);
  }
};

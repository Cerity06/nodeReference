const { promisify } = require('util');
const nodemailer = require('nodemailer');
import { NextFunction, Request, Response } from 'express';
import Member from '../models/MemberModel';
import { MemberDocument, OptionsType, RequestUser } from '../../types';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

export const protect = async (req: RequestUser, res: Response, next: NextFunction) => {
  try {
    // get the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      res.status(401).json({ status: 'unauthorized' });
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists (sometimes a user may have a token but user is deleted or changed pwd)
    const freshMember = await Member.findById(decoded.id);
    if (!freshMember) {
      return res.status(401).json({ status: 'The user does not exist anymore!' });
    }
    if (freshMember?.changedPasswordAfter(decoded.iat)) {
      return res
        .status(401)
        .json({ status: 'User changed password! Please log ins again!' });
    }

    req.user = freshMember;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: RequestUser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({ status: 'User not authorized!' });
    }
    next();
  };
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on post request
  const member = await Member.findOne({ email: req.body.email });
  if (!member) {
    return res.status(404).json({ status: 'User not found!' });
  }

  // Generate random reset token
  const resetToken = member.resetPassword();
  await member.save({ validateBeforeSave: false });

  // send an email notification
  const resetUrl = 'route here with a reset token';
  try {
    await sendEmail({
      email: member.email,
      subject: 'Your password here',
      message: '',
    });
    return res
      .status(200)
      .json({ status: 'success', message: 'token sent to email successfully' });
  } catch (err) {
    member.passwordResettoken = undefined;
    member.passwordResetExpires = undefined;
    await member.save({ validateBeforeSave: false });
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  // GET USER BASED ON THE TOKEN
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await Member.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // if expiration date is greater than now => not expired
    });

    // IF TOKEN HAS NOT EXPIRED, AND USER STILL ACTIVE, SET THE NEW PASSWORD
    if (!user) {
      return res
        .status(400)
        .send({ status: 'fail', message: 'Token is invalid or has expired' });
    }
    user.password = req.body.password;
    user.passwordConfirmed = req.body.passwordConfirmed;
    user.passwordResettoken = undefined;
    user.passwordResetExpires = undefined;

    // UPDATE CHANGEPASSWORDAT PROPERTY FOR THE USER
    await user.save();
    // LOG THE USER IN, SEND JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(err);
  }
};

const sendEmail = async (options: OptionsType) => {
  // CREATE TRANSPORTER
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // DEFINE EMAIL OPTIONS
  const mailOptions = {
    from: 'John@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html...
  };

  // SEND EMAIL
  await transporter.sendMail(mailOptions);
};

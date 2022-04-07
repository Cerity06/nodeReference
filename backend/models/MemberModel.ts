import { Schema, model, Model } from 'mongoose';
import validator from 'validator';
import { MemberDocument } from '../../types';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const memberSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a username!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address!'],
  },
  role: {
    type: String,
    enum: ['user', 'member', 'amdin', 'superUser'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false, // will never be shown in any output
  },
  passwordConfirmed: {
    type: String,
    select: false,
    required: [true, 'Please provide a valid password!'],
    validate: {
      validator: function (this: MemberDocument, el: string) {
        return el === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
  passwordChangedAt: {
    type: Date,
    default: new Date(),
  },
  passwordResettoken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

memberSchema.method('checkPassword', function (password: string): boolean {
  if (bcrypt.compareSync(password, this.password)) return true;
  return false;
});

memberSchema.method('changedPasswordAfter', function (JWTTimesstamp: number): boolean {
  let changedTimestamp: number = 0;
  if (this.passwordChangedAt) {
    const dateSimplified = this.passwordChangedAt.getTime() / 1000;
    changedTimestamp = parseInt(dateSimplified.toString(), 10);
  }
  return JWTTimesstamp < changedTimestamp;
});

memberSchema.method('resetPassword', function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResettoken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
});

memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
});

memberSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; // ensure that the token will be created after the password is updated
  next();
});

memberSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

const Member = model<MemberDocument>('Member', memberSchema);

export default Member;

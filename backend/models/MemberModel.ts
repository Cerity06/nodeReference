import { Schema, model, Model } from 'mongoose';
import validator from 'validator';
import { MemberDocument } from '../../types';
import bcrypt from 'bcryptjs';

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
});

memberSchema.method('checkPassword', function (password: string): boolean {
  if (bcrypt.compareSync(password, this.password)) return true;
  return false;
});

memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
});

memberSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

const Member = model<MemberDocument>('Member', memberSchema);

export default Member;

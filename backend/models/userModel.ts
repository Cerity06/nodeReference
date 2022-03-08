import mongoose from 'mongoose';
import { database } from '../../helpers/process';

mongoose.connect(database).then(() => console.log('connection successful to DB'));

// SPECIFY A SCHEMA WITH VALIDATORS
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'user must have a first_name'], // not required (false) by default
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, 'user must have a last_name'],
  },
  email: {
    type: String,
    unique: [true, 'user must have an email'],
  },
  gender: {
    type: String,
    default: 'undefined',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // hide sensitive information from being called (like pwd)
  },
});

// MODEL CREATED FOR USER BASED ON SCHEMA
const User = mongoose.model('User', userSchema);

export default User;

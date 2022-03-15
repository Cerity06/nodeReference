import mongoose from 'mongoose';
import { UserType } from '../../types';
import slugify from 'slugify';

const { Schema } = mongoose;

// SPECIFY A SCHEMA WITH VALIDATORS
const userSchema = new Schema<UserType>(
  {
    first_name: {
      type: String,
      required: true, // (false) by default
      trim: true,
      maxlength: [40, 'A first name must be less than 40 characters'],
    },
    last_name: {
      type: String,
      required: [true, 'user must have a last_name'],
      minlength: 3,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Bigender', 'Genderqueer', 'Genderfluid'],
        message: '{VALUE} is not supported', // Mongoose replaces {VALUE} with the value being validated.
      },
      default: 'unknown',
    },
    ip_address: { type: String },
    createdAt: {
      type: Date,
      default: Date.now(),
      // SELECT hide sensitive information from being called (like pwd)
      select: false,
      // VALIDATE: this only points to current doc on NEW document creation
      /* validate: function (value) {
          return value < this.price;
      },*/
    },
    slug: {
      type: String,
    },
  },
  {
    // each time it's outputed in JSON, virtuals will be part of the data
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual data - durationWeek cannot be manipulated, read only
//userSchema.virtual('durationWeek').get(function (this: { createdAt: Date }) {
//  return this.createdAt.getDay() / 7;
//});

// MIDDLEWARE
// DOCUMENT MIDDLEWARE: runs only before saving with ".save()" and ".create()"
userSchema.pre('save', function (this: UserType, next) {
  this.slug = slugify(this.first_name + ' ' + this.last_name, { lower: true });
  next();
});

// Show the finished document "post" operation
userSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE
//userSchema.pre('/^find/', function (next) {
//  this.find({ secretUser: { $ne: true } }); // this bind to the query
//  next();
//});

// AGGREGATION MIDDLEWARE
//userSchema.pre('aggregate', function (this: any, next) {
//  this.pipeline().unshift({ $match: { secretUser: { $ne: true } } });
//  next();
//});

// MODEL CREATED FOR USER BASED ON SCHEMA
const User = mongoose.model('User', userSchema);

export default User;

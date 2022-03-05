const mongoose = require('mongoose');
const app = require('./api');
const dotenv = require('dotenv');

type UserType = {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
};

// Only need to be run here for process to be available everywhere
dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => console.log('connection successful to DB'));

// SPECIFY A SCHEMA WITH VALIDATORS
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'user must have a first_name'],
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
  },
});

// MODEL CREATED FOR USER BASED ON SCHEMA
const User = mongoose.model('User', userSchema);

const newUser = new User({
  first_name: 'Patrick',
  last_name: 'Jane',
  email: 'jane@gmail.com',
  gender: 'male',
});

/*newUser
  .save()
  .then((finalDoc: UserType) => console.log(finalDoc))
  .catch((err: Error) => console.log(`Error: ${err}`));
*/
const port = process.env.PORT;
const hostname = '127.0.0.1';

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

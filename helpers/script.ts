const fs = require('fs');
const path = require('path');
import { database } from './process';
import mongoose from 'mongoose';
import User from '../backend/models/userModel';

mongoose.connect(database).then(() => console.log('connection successful to DB'));

const res = fs.readFileSync(path.join(process.cwd(), 'data/data.json'), 'utf8');
const usersData = JSON.parse(res.toString());

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(usersData);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// add in node terminal "node path --import"
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

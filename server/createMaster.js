const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('Krish@2025', 10);
    
    await User.create({
      username: 'Krish_Master',
      email: 'onlinelearninghubteam@gmail.com',
      password: hashedPassword,
      role: 'master'
    });
    
    console.log('Master account created! ✅');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
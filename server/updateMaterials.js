const mongoose = require('mongoose');
const Material = require('./models/Material');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Add favorites and reports fields to all existing materials
    await Material.updateMany(
      {},
      { 
        $set: { 
          favorites: [],
          reports: []
        } 
      }
    );
    
    console.log('All materials updated! ✅');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
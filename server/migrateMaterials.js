const mongoose = require('mongoose');
const Material = require('./models/Material');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('Connecting to MongoDB...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    migrate();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });


async function migrate() {
  try {
    const result = await Material.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'approved' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} materials to 'approved' status`);
    
    const result2 = await Material.updateMany(
      { uploadedBy: { $exists: false } },
      { $set: { uploadedBy: null } }
    );
    
    console.log(`✅ Fixed ${result2.modifiedCount} materials without uploadedBy field`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}
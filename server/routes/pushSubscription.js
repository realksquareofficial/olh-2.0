const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

router.post('/subscribe', protect, async (req, res) => {
  console.log('--- Push Subscribe Request ---');
  console.log('1. Headers:', req.headers);
  console.log('2. Body:', req.body);
  console.log('3. User from Middleware:', req.user);

  try {
    const { token } = req.body;
    
    if (!token) {
      console.log('❌ Error: Token missing in body');
      return res.status(400).json({ message: 'Token required' });
    }

    if (!req.user || !req.user.id) {
      console.log('❌ Error: User ID missing in request');
      return res.status(401).json({ message: 'User not authenticated or invalid token' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('4. Converted UserID:', userId);

    console.log('5. Attempting DB Operation...');
    const subscription = await PushSubscription.findOneAndUpdate(
      { token: token }, 
      { 
        $set: { 
          user: userId, 
          token: token 
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    console.log('✅ Success! Subscription:', subscription);
    res.status(200).json({ message: 'Subscribed successfully', subscription });

  } catch (error) {
    console.error('🔥 CRITICAL ERROR in Subscribe:', error);
    res.status(500).json({ 
      message: 'Subscription failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    console.log('--- Unsubscribe Request ---');
    console.log('User:', req.user.id);
    
    await PushSubscription.deleteMany({ user: req.user.id });
    
    console.log('✅ Unsubscribed successfully');
    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('🔥 Unsubscribe Error:', error);
    res.status(500).json({ message: 'Unsubscribe failed' });
  }
});

module.exports = router;
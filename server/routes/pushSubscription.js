const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

router.post('/subscribe', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const subscription = await PushSubscription.findOneAndUpdate(
      { user: req.user.id },
      { token, user: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Subscribed successfully', subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Subscription failed', error: error.message });
  }
});

router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    await PushSubscription.deleteMany({ user: req.user.id });
    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unsubscribe failed' });
  }
});

module.exports = router;
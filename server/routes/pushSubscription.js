const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const auth = require('../middleware/auth');

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id },
      { subscription },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed' });
  }
});

router.delete('/unsubscribe', auth, async (req, res) => {
  try {
    await PushSubscription.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unsubscribe failed' });
  }
});

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;
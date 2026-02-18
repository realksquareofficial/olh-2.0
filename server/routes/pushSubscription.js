const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

router.post('/subscribe', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    await PushSubscription.findOneAndUpdate(
      { user: req.user.id, token: token },
      { token },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Subscription failed' });
  }
});

router.delete('/unsubscribe', protect, async (req, res) => {
    res.json({ message: 'Unsubscribed' });
});

module.exports = router;
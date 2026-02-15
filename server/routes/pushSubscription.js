const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

const webpush = require('web-push');

router.get('/generate-keys', (req, res) => {
  const vapidKeys = webpush.generateVAPIDKeys();
  res.json(vapidKeys);
});


router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    await PushSubscription.findOneAndUpdate(
      { user: req.user.id },
      { subscription },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Subscription failed' });
  }
});

router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    await PushSubscription.findOneAndDelete({ user: req.user.id });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unsubscribe failed' });
  }
});

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/test-notification', protect, async (req, res) => {
  try {
    const { sendNotification } = require('../utils/pushNotification');
    await sendNotification(req.user.id, {
      title: 'Test Notification 🔔',
      body: 'If you see this, it works!',
      url: '/profile'
    });
    res.json({ message: 'Sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending test notification' });
  }
});

module.exports = router;
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendNotification = async (userId, payload) => {
  try {
    const subscription = await PushSubscription.findOne({ user: userId });
    if (!subscription) return;

    await webpush.sendNotification(subscription.subscription, JSON.stringify(payload));
  } catch (error) {
    if (error.statusCode === 410) {
      await PushSubscription.findOneAndDelete({ user: userId });
    }
    console.error('Push notification error:', error);
  }
};

module.exports = { sendNotification };

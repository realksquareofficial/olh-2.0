const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "olh-2-0-push",
  "private_key_id": "554c8196ba1bd73b5fb519c9227e140bf893b077",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  "client_email": "firebase-adminsdk-fbsvc@olh-2-0-push.iam.gserviceaccount.com",
  "client_id": "111305239597068655393",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40olh-2-0-push.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const sendNotification = async (userId, payload) => {
  try {
    const PushSubscription = require('../models/PushSubscription');
    const subscriptions = await PushSubscription.find({ user: userId });
    
    if (!subscriptions.length) return;

    const tokens = subscriptions.map(sub => sub.token);
    
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url || '/'
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent message:', response);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.log('Failed tokens:', failedTokens);
      await PushSubscription.deleteMany({ token: { $in: failedTokens } });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { sendNotification };

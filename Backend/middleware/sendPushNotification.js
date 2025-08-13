const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid Expo push token: ${pushToken}`);
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
}

module.exports = sendPushNotification;

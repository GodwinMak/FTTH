import React, { useEffect } from "react";
import { useSearchContext } from "../hooks/useSerachContext";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

// Set default notification behavior (foreground display)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationHandler = () => {
  const { dispatch } = useSearchContext();
  // ✅ Notification Listeners
  useEffect(() => {
    // Triggered when a notification is received while the app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        //   console.log("📩 Notification received:", notification);
      }
    );

    // Triggered when user taps on a notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        dispatch({ type: "SET_QUERY", payload: data });
        router.push("/tabs/task");
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  return null;
};

export default NotificationHandler;

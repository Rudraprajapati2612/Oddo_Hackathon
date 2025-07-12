// File: src/ws/notification.ts
import { sendNotification } from ".";

export interface NotificationPayload {
  userId: number;
  message: string;
  type: "mention" | "answer" | "comment" | "swap-request" | "swap-response";
}

export const notifyUser = async ({ userId, message, type }: NotificationPayload) => {
  const payload = {
    message,
    type,
    timestamp: new Date().toISOString(),
  };

  sendNotification(userId.toString(), payload);
};

import type Elysia from "elysia";
import { ENV } from "~/config";
import { firebasePlugin, type NotificationPayload } from "~/plugins/firebase";
import { schedulerPlugin } from "~/plugins/scheduler";

export function NotificationInfra(elysia: Elysia) {
  return elysia.use(
    firebasePlugin({
      appName: ENV.APP_NAME,
      serviceAccount: ENV.FIREBASE_PRIVATE_KEY,
    }),
  )
  .use((app) =>
    schedulerPlugin({
      'send-push-notification': async (payload) => {
        const { token, title, body } = payload as NotificationPayload;

        console.log(`[Job] Executing push notification for ${token.slice(0, 8)}...`);
        try {
          // Now we can use the firebase decorator from the app instance
          const response = await app.decorator.firebase.sendPush(token, title, body);
          console.log(`[Job] Notification sent! ID: ${response}`);
        } catch (err: unknown) {
          const error = err as Error;
          console.error(`[Job] Failed to send notification: ${error.message}`);
          throw error; // Rethrow to mark job as failed in DB
        }
      },
      'cleanup-task': async (payload) => {
        console.log('[Job] Running cleanup...', payload);
      },
    }),
  )
}
import { Elysia } from 'elysia';
import type { AppOptions, ServiceAccount } from 'firebase-admin';
import admin from 'firebase-admin';

export interface FirebasePluginOptions {
  serviceAccount?: string | ServiceAccount;
  firebaseOptions?: AppOptions;
  appName?: string;
}

// Request payload for sending notification
export type NotificationPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

/**
 * Firebase Admin SDK plugin for Elysia
 * Exposes 'firebase' to the request context and as a decorator.
 */
export const firebasePlugin = (options?: FirebasePluginOptions) => {
  const { serviceAccount, firebaseOptions, appName } = options || {};

  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.some((app) => app?.name === (appName || '[DEFAULT]'))) {
    const config: AppOptions = {
      ...firebaseOptions,
    };
    if (typeof serviceAccount === 'string') {
      const keys = JSON.parse(serviceAccount);
      keys.private_key = keys.private_key.replace(/\\n/gm, '\n');
      config.credential = admin.credential.cert(keys);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.credential = admin.credential.applicationDefault();
    }

    admin.initializeApp(config, appName);
  }

  const app = admin.app(appName);

  return new Elysia({ name: 'firebase' }).decorate('firebase', {
    admin,
    app,
    messaging: app.messaging(),
    firestore: app.firestore(),
    auth: app.auth(),
    /**
     * Send a simple push notification via FCM
     */
    sendPush: async (token: string, title: string, body: string, data?: Record<string, string>) => {
      return app.messaging().send({
        token,
        notification: { title, body },
        data,
      });
    },
    sendTopic: async (
      topic: string,
      title: string,
      body: string,
      data?: Record<string, string>,
    ) => {
      return app.messaging().send({
        topic,
        notification: { title, body },
        data,
      });
    },
    sendMultiplePush: async (
      tokens: string[],
      title: string,
      body: string,
      data?: Record<string, string>,
    ) => {
      return app.messaging().sendEach(
        tokens.map((token) => ({
          token,
          notification: { title, body },
          data,
        })),
      );
    },
  });
};

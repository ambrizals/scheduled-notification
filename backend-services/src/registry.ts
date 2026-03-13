import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { ENV } from "./config";
import { NotificationInfra } from "./infra/notification";
import { firebasePlugin } from "./plugins/firebase";

export const registry = new Elysia({
  name: ENV.APP_NAME,
})
  .use(openapi({
    path: '/docs'
  }))
  .use(NotificationInfra)
  .use(firebasePlugin({
    appName: ENV.APP_NAME,
    serviceAccount: ENV.FIREBASE_PRIVATE_KEY,
  }))

export type Registry = typeof registry
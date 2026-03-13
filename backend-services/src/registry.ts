import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { firebasePlugin, type NotificationPayload } from "./plugins/firebase";
import { schedulerPlugin } from "./plugins/scheduler";
import { ENV } from "./config";
import { NotificationInfra } from "./infra/notification";

export const registry = new Elysia({
  name: ENV.APP_NAME,
})
  .use(openapi({
    path: '/docs'
  }))
  .use(NotificationInfra)

export type Registry = typeof registry
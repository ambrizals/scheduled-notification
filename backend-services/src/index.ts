import { t } from 'elysia';
import { registry } from './registry';
import { notificationController } from './modules/notification/notification.controller';
import { ENV } from './config';
import openapi from '@elysiajs/openapi';

const app = registry
  .use(openapi())
  .get('/', () => ({ status: 'ok', message: 'Elysia on Bun API Service' }))
  .use(notificationController)
  .listen(ENV.APP_PORT);

console.log(`🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`);

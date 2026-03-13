import { t } from "elysia";
import type { Registry } from "~/registry";

export function notificationController(ctx: Registry) {
  return ctx.post(
    '/notifications/schedule',
    async ({ body, scheduler }) => {
      const { token, title, msgBody, sendAt } = body;
      const targetDate = new Date(sendAt);
      const jobId = `notif-${token.slice(0, 5)}-${targetDate.getTime()}`;

      await scheduler.schedule({
        id: jobId,
        name: 'send-push-notification',
        runAt: targetDate,
        payload: { token, title, body: msgBody },
      });

      return {
        success: true,
        jobId,
        scheduledFor: targetDate.toISOString(),
      };
    },
    {
      body: t.Object({
        token: t.String(),
        title: t.String(),
        msgBody: t.String(),
        sendAt: t.Union([t.String(), t.Number()]),
      }),
    },
  ).post('/notifications/self-schedule', async ({
    firebase, body
  }) => {
    const response = await firebase.sendPush(body.token, body.title, body.msgBody, {
      type: 'self-schedule',
      time: body.time,
    })

    return {
      success: true,
      notificationId: response,
    }
  }, {
    body: t.Object({
      token: t.String(),
      title: t.String(),
      msgBody: t.String(),
      time: t.String(),
      timezone: t.String()
    })
  })
}
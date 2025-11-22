import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const twilioWebhook = httpAction(async (ctx, request) => {
  const rawBody = await request.text();

  console.log("Received Twilio webhook:", rawBody);

  await ctx.scheduler.runAfter(0, internal.webhook.handleTwilioWebhook, {
    body: rawBody,
    signature: request.headers.get("X-Twilio-Signature") || "",
  });

  return new Response("", { status: 200 });
});

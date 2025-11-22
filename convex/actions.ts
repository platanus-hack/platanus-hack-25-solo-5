"use node";

import { internalAction } from "./_generated/server";
import { sendMessage } from "./twilio.server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { markdownToWhatsApp } from "./utils/markdownToWhatsApp";

export const sendWhatsAppMessage = internalAction({
  args: {
    to: v.string(),
    from: v.string(),
    body: v.string(),
    sid: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, { to, from, body, sid, token }) => {
    const twilioSid = sid || process.env.TWILIO_ACCOUNT_SID as string;
    const twilioToken = token || process.env.TWILIO_AUTH_TOKEN as string;

    const formattedBody = markdownToWhatsApp(body);

    const MAX_LENGTH = 1500;

    if (formattedBody.length <= MAX_LENGTH) {
      const sentMessage = await sendMessage({
        to,
        from,
        body: formattedBody,
        sid: twilioSid,
        token: twilioToken,
      });

      console.log(`✅ WhatsApp message sent - SID: ${sentMessage.sid}`);
    } else {
      console.log(`📝 Message too long (${formattedBody.length} chars), splitting into multiple messages`);

      const chunks: string[] = [];
      let currentChunk = "";
      const lines = formattedBody.split('\n');

      for (const line of lines) {
        if ((currentChunk + '\n' + line).length > MAX_LENGTH) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = line;
        } else {
          currentChunk += (currentChunk ? '\n' : '') + line;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());

      console.log(`📤 Sending ${chunks.length} message parts`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prefix = chunks.length > 1 ? `(${i + 1}/${chunks.length}) ` : '';

        const sentMessage = await sendMessage({
          to,
          from,
          body: prefix + chunk,
          sid: twilioSid,
          token: twilioToken,
        });

        console.log(`✅ Part ${i + 1}/${chunks.length} sent - SID: ${sentMessage.sid}`);

        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  },
});

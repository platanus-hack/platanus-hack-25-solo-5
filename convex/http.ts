import { httpRouter } from "convex/server";
import { twilioWebhook } from "./twilioApi";

const http = httpRouter();

http.route({
  path: "/v1/twilio/webhook",
  method: "POST",
  handler: twilioWebhook,
});

export default http;

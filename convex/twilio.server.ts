import twilio from "twilio";

const isProd = process.env.NODE_ENV === "production";

const twilioClient = getTwilioClient(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string,
);

export function getTwilioClient(sid: string, token: string) {
  return twilio(sid, token);
}

/**
 * Update WhatsApp Sender webhook configuration
 * This updates the sender's webhook and status callback URLs
 */
export async function sendMessage({
  from,
  to,
  body,
  mediaUrl,
  contentType,
  sid,
  token,
  contentSid,
  contentVariables,
}: {
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  contentType?: string;
  sid: string;
  token: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
}) {
  console.log("sendWhatsAppMessage", {
    from,
    to,
    body,
    mediaUrl,
    contentType,
    contentSid,
    contentVariables,
  });

  const messageParams: any = {
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`,
    body: body,
    statusCallback: `${process.env.CONVEX_SITE_URL}/v1/twilio/status`,
  };

  // Only include contentSid if it's provided and not empty
  if (contentSid && contentSid.trim()) {
    messageParams.contentSid = contentSid;
  }

  // Only include contentVariables if contentSid is provided and variables exist
  if (
    contentSid &&
    contentSid.trim() &&
    contentVariables &&
    Object.keys(contentVariables).length > 0
  ) {
    messageParams.contentVariables = JSON.stringify(contentVariables);
  }
  console.log("messageParams", messageParams);
  try {
    console.log(`Sending message to ${to}`);
    const client = getTwilioClient(sid, token);

    console.log("Message to send:", messageParams);

    // Handle media file attachment
    if (mediaUrl) {
      try {
        console.log(`Processing media file from URL: ${mediaUrl}`);
        console.log(`Content-Type: ${contentType || "not specified"}`);

        // Check if this is an audio file for WhatsApp compatibility
        if (contentType && contentType.startsWith("audio/")) {
          console.log(
            "🎵 AUDIO FILE DETECTED - Analyzing WhatsApp compatibility",
          );
          console.log("📊 Audio Content-Type:", contentType);
          console.log("🔗 Audio URL:", mediaUrl);

          // Twilio WhatsApp supported audio formats
          // MP3 es el formato más confiable y compatible
          const supportedAudioTypes = [
            "audio/mpeg", // MP3 - FORMATO RECOMENDADO
            "audio/mp3", // MP3 alternate
            "audio/aac", // AAC - buena compatibilidad
            "audio/ogg", // OGG - puede tener problemas
            "audio/amr", // AMR - formato antiguo
            "audio/3gp", // 3GP - formato móvil
          ];

          console.log(
            "✅ Supported formats (MP3 preferred):",
            supportedAudioTypes,
          );

          const isSupported = supportedAudioTypes.some((type) =>
            contentType.includes(type.split("/")[1]),
          );

          if (!isSupported) {
            console.error(
              `❌ CRITICAL: Audio format ${contentType} is NOT supported by Twilio WhatsApp!`,
            );
            console.error(
              `❗ Supported formats: ${supportedAudioTypes.join(", ")}`,
            );
            console.error(`📝 This may cause delivery failure!`);
          } else {
            console.log(
              `✅ SUCCESS: Audio format ${contentType} is supported by Twilio WhatsApp`,
            );
          }
        }

        // For WhatsApp, we need to use mediaUrl directly
        // The URL must be public and accessible via HTTPS

        // Twilio requires public HTTPS URLs for media attachments
        if (!mediaUrl.startsWith("https://")) {
          console.error("WhatsApp requires HTTPS URLs for media");
          throw new Error("Media URL must use HTTPS for WhatsApp");
        } else {
          // For regular URLs, just log the URL for debugging
          console.log("Regular URL used for media, proceeding with sending");
          // No validation needed - Twilio will handle file type validation
        }

        console.log(`Using media URL directly: ${mediaUrl}`);

        // Set mediaUrl property - Twilio expects a string or array of URLs
        messageParams.mediaUrl = mediaUrl;

        console.log("Message configured with media attachment:", {
          mediaUrl: messageParams.mediaUrl,
          contentType: contentType || "unknown",
        });
      } catch (mediaError) {
        console.error("Error processing media:", mediaError);
        // Continue with text-only message in case of error
      }
    }

    // Before sending, let's check if we have a mediaUrl and test accessing it
    if (messageParams.mediaUrl) {
      try {
        console.log(
          "🔍 TESTING MEDIA URL ACCESSIBILITY:",
          messageParams.mediaUrl,
        );
        console.log("📄 Using HEAD request to verify media accessibility");

        const mediaUrlTest = await fetch(messageParams.mediaUrl, {
          method: "HEAD",
        });

        console.log("📊 Media URL Response Status:", mediaUrlTest.status);
        const responseContentType = mediaUrlTest.headers.get("content-type");
        console.log("📁 Media URL Response Headers:", {
          "content-type": responseContentType,
          "content-length": mediaUrlTest.headers.get("content-length"),
          "cache-control": mediaUrlTest.headers.get("cache-control"),
        });

        // CRITICAL: Verificar si el tipo de contenido del servidor coincide con el esperado
        if (
          responseContentType &&
          contentType &&
          responseContentType !== contentType
        ) {
          console.warn(`⚠️ CONTENT TYPE MISMATCH:`);
          console.warn(`   Expected: ${contentType}`);
          console.warn(`   Actual from server: ${responseContentType}`);
          console.warn(`   This might cause WhatsApp delivery issues!`);
        }

        if (!mediaUrlTest.ok) {
          console.error(
            `❌ MEDIA URL TEST FAILED with status ${mediaUrlTest.status}`,
          );
          console.error(
            "🚑 Attempting to send message without media attachment",
          );
          delete messageParams.mediaUrl;
        } else {
          console.log("✅ MEDIA URL TEST SUCCESSFUL - URL is accessible");
          console.log(
            "🔗 Final media URL that will be sent to Twilio:",
            messageParams.mediaUrl,
          );
        }
      } catch (error) {
        console.error("❌ MEDIA URL TEST FAILED with exception:", error);
        console.error("🚑 Attempting to send message without media attachment");
        delete messageParams.mediaUrl;
      }
    }

    // Send message to Twilio with or without media attachment
    console.log(
      "Sending message to Twilio:",
      messageParams.body,
      messageParams.mediaUrl
        ? `with media attachment: ${messageParams.mediaUrl}`
        : "without media attachment",
    );

    // Create the message with Twilio API
    console.log("🚀 SENDING MESSAGE TO TWILIO API...");
    console.log("📄 Final messageParams being sent:", {
      to: messageParams.to,
      from: messageParams.from,
      body: messageParams.body,
      mediaUrl: messageParams.mediaUrl,
      hasMedia: !!messageParams.mediaUrl,
    });

    const sentMessage = await client.messages.create(messageParams);

    // Log success with message details
    console.log("✅ MESSAGE SENT SUCCESSFULLY!");
    console.log("🎉 Twilio Message SID:", sentMessage.sid);
    console.log("📁 Message Details:", {
      body: sentMessage.body,
      status: sentMessage.status,
      errorCode: sentMessage.errorCode,
      errorMessage: sentMessage.errorMessage,
      numMedia: sentMessage.numMedia,
      direction: sentMessage.direction,
      uri: sentMessage.uri,
    });

    // CRITICAL: Log media-specific information for audio messages
    if (messageParams.mediaUrl) {
      console.log("🎵 AUDIO MESSAGE DETAILS:");
      console.log("   🔗 Media URL sent:", messageParams.mediaUrl);
      console.log("   📁 Number of media attachments:", sentMessage.numMedia);
      console.log("   🔍 Message status:", sentMessage.status);

      if (sentMessage.errorCode) {
        console.error("❌ TWILIO ERROR CODE:", sentMessage.errorCode);
        console.error("❌ TWILIO ERROR MESSAGE:", sentMessage.errorMessage);
      }
    }
    return sentMessage;
  } catch (error) {
    console.error("Error sending message via Twilio:", error);
    throw new Error(
      `Failed to send message: ${(error as Error).message} messageParams`,
    );
  }
}

export async function downloadTwilioImage(mediaUrl: string): Promise<Blob> {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

  const res = await fetch(mediaUrl, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString(
          "base64",
        ),
    },
  });

  if (!res.ok) {
    console.error("Error downloading Twilio image:", res.statusText);
    throw new Error(`Failed to download image: ${res.statusText}`);
  }

  return await res.blob();
}

interface CreateWhatsAppTemplatesParams {
  name: string;
  body: string;
  category: "marketing" | "utility";
  language: string;
  variables?: Record<string, string>;
  buttons: {
    text: string;
  }[];
  type: "text" | "interactive";
  sid: string;
  token: string;
}

export async function createWhatsAppTemplates({
  name,
  body,
  category,
  language,
  variables,
  buttons,
  type,
  sid,
  token,
}: CreateWhatsAppTemplatesParams): Promise<any> {
  const types = type === "text" ? "twilio/text" : "twilio/quick-reply";

  const payload = JSON.stringify({
    friendly_name: name,
    language,
    variables: variables || {},
    types: {
      [`${types}`]: {
        body,
        actions: buttons.map((button, index) => ({
          title: button.text,
          id: `${index + 1}`,
        })),
      },
    },
  });

  console.log(payload);
  console.log("Basic " + Buffer.from(`${sid}:${token}`).toString("base64"));
  try {
    const res = await fetch("https://content.twilio.com/v1/Content", {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/json",
      },
      method: "POST",
      body: payload,
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Twilio API Error:", {
        status: res.status,
        statusText: res.statusText,
        response: responseData,
      });
      throw new Error(
        `Failed to create WhatsApp template: ${JSON.stringify(responseData)}`,
      );
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error creating WhatsApp template:", error);
    throw new Error(`Failed to create WhatsApp template: ${error}`);
  }
}

export async function sendWhatsAppTemplate(
  templateSid: string,
  name: string,
  category: "marketing" | "utility",
  sid: string,
  token: string,
) {
  try {
    const res = await fetch(
      `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests/whatsapp`,
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          name: name,
          category: category,
        }),
      },
    );

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Twilio API Error:", {
        status: res.status,
        statusText: res.statusText,
        response: responseData,
      });
      throw new Error(`Failed to send WhatsApp template: ${responseData}`);
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error sending WhatsApp template:", error);
    throw new Error(`Failed to send WhatsApp template: ${error}`);
  }
}

export async function getWhatsAppTemplateStatus(
  templateSid: string,
  sid: string,
  token: string,
) {
  const res = await fetch(
    `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests`,
    {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/json",
      },
      method: "GET",
    },
  );

  const responseData = await res.json();

  return responseData;
}

export async function deleteTwilioWhatsAppTemplate(
  templateSid: string,
  sid: string,
  token: string,
) {
  const res = await fetch(
    `https://content.twilio.com/v1/Content/${templateSid}`,
    {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/json",
      },
      method: "DELETE",
    },
  );

  return res;
}

export async function updateTwilioSender({
  senderSid,
  status,
  configuration,
  profile,
  webhook,
  sid,
  token,
}: {
  senderSid: string;
  status?: "ONLINE:UPDATING";
  configuration?: {
    waba_id?: string;
  };
  profile?: {
    about?: string;
    name?: string;
    vertical?: string;
    websites?: Array<{
      website: string;
      label: string;
    }>;
    address?: string;
    logo_url?: string;
    emails?: Array<{
      email: string;
      label: string;
    }>;
    description?: string;
  };
  webhook?: {
    callback_method?: string;
    callback_url?: string;
  };
  sid: string;
  token: string;
}) {
  const url = `https://messaging.twilio.com/v2/Channels/Senders/${senderSid}`;

  // Build the payload with only the fields we want to update
  const payload: any = {};

  if (status) {
    payload.status = status;
  }

  if (configuration) {
    payload.configuration = configuration;
  }

  if (profile) {
    payload.profile = profile;
  }

  if (webhook) {
    payload.webhook = webhook;
  }

  console.log("Updating Twilio sender:", senderSid);
  console.log("Update payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      console.error("Twilio API Error:", {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
      });
      throw new Error(
        `Failed to update sender: ${JSON.stringify(responseData)}`,
      );
    }

    console.log("Twilio sender updated successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error updating Twilio sender:", error);
    throw error;
  }
}

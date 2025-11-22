"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { parse } from "querystring";
import twilio from "twilio";
import { downloadTwilioImage } from "./twilio.server";
import { MessageType, TwilioMessage } from "./types";
import { api, internal } from "./_generated/api";
import { yourTrainerAgent } from "./agents/yourTrainerAgent";
import { markdownToWhatsApp } from "./utils/markdownToWhatsApp";

const TWILIO_WEBHOOK_URL = process.env.CONVEX_SITE_URL + "/v1/twilio/webhook";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

export const handleTwilioWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, { body, signature }) => {
    const parsed = parse(body);
    const requestId = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();

    // Ensure messageSid is a string (querystring parse can return string[])
    const messageSidRaw = parsed["MessageSid"] || parsed["SmsMessageSid"];
    const messageSid = Array.isArray(messageSidRaw)
      ? messageSidRaw[0]
      : messageSidRaw;

    // Ensure body is a string for logging
    const bodyRaw = parsed["Body"];
    const bodyString = Array.isArray(bodyRaw) ? bodyRaw[0] : bodyRaw;

    // Enhanced logging for debugging duplicate notifications
    console.log(`🔍 [${requestId}] WEBHOOK START - ${timestamp}`, {
      messageSid,
      from: parsed["From"],
      to: parsed["To"],
      body: bodyString?.substring(0, 50) + "...",
      smsStatus: parsed["SmsStatus"],
      numMedia: parsed["NumMedia"],
    });

    // For inbound messages, lookup the receiving Twilio number (To)
    let to = parsed["To"] as string;
    to = to.replace("whatsapp:", "");

    console.log(`🔍 [${requestId}] Looking up receiving phone: ${to}`);

    if (!TWILIO_WEBHOOK_URL) {
      console.error(
        "TWILIO_WEBHOOK_URL no está configurado. Verifica tus variables de entorno.",
      );
      return;
    }

    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN || "",
      signature,
      TWILIO_WEBHOOK_URL,
      parsed,
    );

    if (!isValid) {
      console.warn("Webhook de Twilio inválido. Posible spoofing.");
      return;
    }

    // Firma válida: procesamos el mensaje
    console.log("Twilio webhook autenticado:", parsed);

    // Extract phone numbers
    const fromPhone = (parsed["From"] as string).replace("whatsapp:", "");
    const toPhone = (parsed["To"] as string).replace("whatsapp:", "");
    const profileName = parsed["ProfileName"] as string;
    const messageBody = parsed["Body"] as string;
    const numMedia = parsed["NumMedia"] as string;
    const mediaUrl = parsed["MediaUrl0"] as string;
    const contentType = parsed["MediaContentType0"] as string;
    const messageType = parsed["MessageType"] as MessageType;

    console.log(`📱 [${requestId}] Processing message from ${fromPhone} to ${toPhone}`);

    // Get or create thread for this phone pair
    const threadId = await ctx.runMutation(internal.agents.threadHelpers.getOrCreateThread, {
      from: fromPhone,
      to: toPhone,
      userName: profileName,
    });

    console.log(`🧵 [${requestId}] Using thread: ${threadId}`);

    // Handle audio messages (check FIRST before all media types)
    if (numMedia && parseInt(numMedia) > 0 && contentType && contentType.startsWith("audio/")) {
      console.log(`🎵 [${requestId}] AUDIO MESSAGE - downloading audio`);

      const blob = await downloadTwilioImage(mediaUrl);
      const storageId = await ctx.storage.store(blob);
      const audioConvexUrl = (await ctx.storage.getUrl(storageId)) as string;

      console.log(`🎵 [${requestId}] Audio stored in Convex Storage`);

      await yourTrainerAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "user",
          content: "[User sent a voice message]",
        },
      });

      await ctx.runMutation(api.admin.saveAdminMessage, {
        threadId,
        phoneNumber: fromPhone,
        role: "user",
        content: "[User sent a voice message]",
      });

      console.log(`💾 [${requestId}] AUDIO MESSAGE SAVED - transcribing with Groq Whisper`);

      try {
        const transcription: any = await ctx.runAction(
          (internal as any).audioTranscription.transcribeAudio,
          {
            phoneNumber: fromPhone,
            audioUrl: audioConvexUrl,
          }
        );

        console.log(`🤖 [${requestId}] Audio transcribed: "${transcription.text}"`);

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "user",
            content: transcription.text,
          },
        });

        await ctx.runMutation(api.admin.saveAdminMessage, {
          threadId,
          phoneNumber: fromPhone,
          role: "user",
          content: transcription.text,
        });

        const { text: aiResponse } = await yourTrainerAgent.generateText(ctx, {
          threadId,
          userId: fromPhone,
        }, {
          prompt: transcription.text,
        });

        await ctx.runMutation(api.admin.saveAdminMessage, {
          threadId,
          phoneNumber: fromPhone,
          role: "assistant",
          content: aiResponse,
        });

        console.log(`🤖 [${requestId}] AI Response generated from audio: ${aiResponse.substring(0, 50)}...`);

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: aiResponse,
        });

        console.log(`✅ [${requestId}] Audio response sent`);
      } catch (error) {
        console.error(`❌ [${requestId}] Audio transcription failed:`, error);

        const errorMessage = "Lo siento, tuve un problema al procesar tu mensaje de voz. ¿Podrías intentar enviar el mensaje de nuevo o escribirlo como texto?";

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "assistant",
            content: errorMessage,
          },
        });

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: errorMessage,
        });

        console.log(`✅ [${requestId}] Error message sent`);
      }
      return;
    }

    // Handle video messages (check FIRST before generic media)
    if (numMedia && parseInt(numMedia) > 0 && contentType && contentType.startsWith("video/")) {
      console.log(`🔍 [${requestId}] VIDEO MESSAGE - downloading video`);

      const blob = await downloadTwilioImage(mediaUrl);
      const storageId = await ctx.storage.store(blob);
      const videoConvexUrl = (await ctx.storage.getUrl(storageId)) as string;

      await ctx.runMutation(api.userProfiles.updateLastVideo, {
        phoneNumber: fromPhone,
        videoUrl: videoConvexUrl,
        videoStorageId: storageId,
      });

      console.log(`🎥 [${requestId}] Last video updated in profile`);

      await yourTrainerAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "user",
          content: messageBody || "[User sent an exercise video]",
        },
      });

      console.log(`💾 [${requestId}] VIDEO MESSAGE SAVED - detecting exercise`);

      ctx.scheduler.runAfter(0, internal.actions.sendWhatsAppMessage, {
        to: fromPhone,
        from: toPhone,
        body: "🎥 Procesando tu video...",
      });

      try {
        const exerciseDetection: any = await ctx.runAction(
          (internal as any).biomechanicsInternal.detectExerciseOnly,
          {
            phoneNumber: fromPhone,
          }
        );

        console.log(`🤖 [${requestId}] Exercise detected: ${exerciseDetection.exercise}`);

        await ctx.runMutation(api.biomechanics.savePendingConfirmation, {
          phoneNumber: fromPhone,
          detectedExercise: exerciseDetection.exercise,
          videoUrl: videoConvexUrl,
          videoStorageId: storageId,
        });

        console.log(`💾 [${requestId}] Pending confirmation saved`);

        const confirmationMessage = `Veo que estás entrenando *${exerciseDetection.exercise}*, ¿es así?`;

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "assistant",
            content: confirmationMessage,
          },
        });

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: confirmationMessage,
        });

        console.log(`✅ [${requestId}] Confirmation question sent`);
      } catch (error) {
        console.error(`❌ [${requestId}] Exercise detection failed:`, error);

        const errorMessage = "Lo siento, tuve un problema al procesar tu video. ¿Podrías intentar enviar el video de nuevo? Asegúrate de que el video muestre claramente tu ejercicio y tenga buena iluminación.";

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "assistant",
            content: errorMessage,
          },
        });

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: errorMessage,
        });

        console.log(`✅ [${requestId}] Error message sent`);
      }
      return;
    }

    // Handle image messages (after video check)
    if (numMedia && parseInt(numMedia) > 0) {
      console.log(`🔍 [${requestId}] IMAGE MESSAGE - downloading image`);

      const blob = await downloadTwilioImage(mediaUrl);
      const storageId = await ctx.storage.store(blob);
      const mediaConvexUrl = (await ctx.storage.getUrl(storageId)) as string;

      await ctx.runMutation(api.userProfiles.updateLastImage, {
        phoneNumber: fromPhone,
        imageUrl: mediaConvexUrl,
        imageStorageId: storageId,
      });

      console.log(`📸 [${requestId}] Last image updated in profile`);

      await yourTrainerAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "user",
          content: messageBody || "[User sent a physique photo]",
        },
      });

      console.log(`💾 [${requestId}] IMAGE MESSAGE SAVED - calling direct image analysis`);

      ctx.scheduler.runAfter(0, internal.actions.sendWhatsAppMessage, {
        to: fromPhone,
        from: toPhone,
        body: "🔍 Analizando tu foto, dame un momento...",
      });

      try {
        const analysisResult: any = await ctx.runAction(
          (internal as any).bodyScansInternal.analyzeLatestImage,
          {
            phoneNumber: fromPhone,
          }
        );

        console.log(`🤖 [${requestId}] Image analysis completed successfully`);

        const formattedResponse = `¡He analizado tu foto! Aquí está mi evaluación:

**1. Lo que veo**
Grasa corporal: ${analysisResult.analysis.bodyfatPercentage.min}-${analysisResult.analysis.bodyfatPercentage.max}%
Tipo de físico: ${analysisResult.analysis.physiqueType}

**2. Tus fortalezas**
${analysisResult.analysis.strengths.map((s: string) => `- ${s}`).join('\n')}

**3. Oportunidades de mejora**
${analysisResult.analysis.opportunities.map((o: string) => `- ${o}`).join('\n')}

*Estas estimaciones visuales son útiles para entrenar, pero no sustituyen evaluaciones médicas.*

────────────────

Listo, ahí tienes mi evaluación. ¿Te armo un programa de entrenamiento personalizado? También puedo analizar otra foto o responder cualquier duda que tengas.`;

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "assistant",
            content: formattedResponse,
          },
        });

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: formattedResponse,
        });

        console.log(`✅ [${requestId}] Image analysis response sent`);
      } catch (error) {
        console.error(`❌ [${requestId}] Image analysis failed:`, error);

        const errorMessage = "Lo siento, tuve un problema al analizar tu foto. ¿Podrías intentar enviarla de nuevo? Asegúrate de que la foto esté bien iluminada y muestre claramente tu físico.";

        await yourTrainerAgent.saveMessage(ctx, {
          threadId,
          message: {
            role: "assistant",
            content: errorMessage,
          },
        });

        await ctx.runAction(internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: errorMessage,
        });

        console.log(`✅ [${requestId}] Error message sent`);
      }
      return;
    }

    // Handle location messages
    if (messageType === "location" && parsed["Latitude"] && parsed["Longitude"]) {
      const latitude = parsed["Latitude"] as string;
      const longitude = parsed["Longitude"] as string;
      const address = parsed["Address"] as string;

      console.log(`📍 [${requestId}] LOCATION MESSAGE - ${latitude}, ${longitude}`);

      await yourTrainerAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "user",
          content: address || `Location: ${latitude}, ${longitude}`,
        },
      });

      console.log(`✅ [${requestId}] LOCATION MESSAGE SAVED`);
      return;
    }

    // Handle text messages
    if (messageBody) {
      console.log(`💬 [${requestId}] TEXT MESSAGE - ${messageBody.substring(0, 50)}...`);

      const pendingConfirmation = await ctx.runQuery(
        api.biomechanics.getPendingConfirmation,
        { phoneNumber: fromPhone }
      );

      if (pendingConfirmation) {
        const lowerBody = messageBody.toLowerCase().trim();

        if (lowerBody === 'sí' || lowerBody === 'si' || lowerBody === 'yes' || lowerBody === 'correcto' || lowerBody === 'exacto') {
          console.log(`✅ [${requestId}] User confirmed exercise: ${pendingConfirmation.detectedExercise}`);

          await ctx.runMutation(api.biomechanics.deletePendingConfirmation, {
            phoneNumber: fromPhone,
          });

          ctx.scheduler.runAfter(0, internal.actions.sendWhatsAppMessage, {
            to: fromPhone,
            from: toPhone,
            body: "Perfecto, analizando tu técnica...",
          });

          try {
            const analysisResult: any = await ctx.runAction(
              (internal as any).biomechanicsInternal.analyzeExerciseTechnique,
              {
                phoneNumber: fromPhone,
                exercise: pendingConfirmation.detectedExercise,
                videoUrl: pendingConfirmation.videoUrl,
                videoStorageId: pendingConfirmation.videoStorageId,
              }
            );

            console.log(`🤖 [${requestId}] Technique analysis completed`);

            const referenceVideo: any = await ctx.runAction(
              (internal as any).youtubeInternal.getExerciseReferenceVideo,
              {
                exercise: analysisResult.analysis.exercise,
              }
            );

            const formattedResponse = `¡He analizado tu técnica! Aquí está mi evaluación:

**Ejercicio:** ${analysisResult.analysis.exercise}

**Lo que haces bien:**
${analysisResult.analysis.strengths.map((s: string) => `- ${s}`).join('\n')}

${referenceVideo?.videoUrl ? `**📺 Video de referencia (técnica correcta):**
${referenceVideo.videoUrl}

` : ''}**3 cosas para mejorar:**
${analysisResult.analysis.corrections.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

${analysisResult.analysis.regressions && analysisResult.analysis.regressions.length > 0 ? `**Variación más fácil:**
${analysisResult.analysis.regressions.map((r: string) => `- ${r}`).join('\n')}` : ''}

${analysisResult.analysis.progressions && analysisResult.analysis.progressions.length > 0 ? `**Variación más difícil:**
${analysisResult.analysis.progressions.map((p: string) => `- ${p}`).join('\n')}` : ''}

${analysisResult.analysis.riskFactors && analysisResult.analysis.riskFactors.length > 0 ? `**⚠️ Factores de riesgo:**
${analysisResult.analysis.riskFactors.map((rf: string) => `- ${rf}`).join('\n')}` : ''}

────────────────

Perfecto, eso es lo que vi en tu técnica. ¿Quieres que diseñemos un programa completo o revisamos otro ejercicio?`;

            await yourTrainerAgent.saveMessage(ctx, {
              threadId,
              message: {
                role: "assistant",
                content: formattedResponse,
              },
            });

            await ctx.runAction(internal.actions.sendWhatsAppMessage, {
              to: fromPhone,
              from: toPhone,
              body: formattedResponse,
            });

            console.log(`✅ [${requestId}] Analysis response sent`);
          } catch (error) {
            console.error(`❌ [${requestId}] Technique analysis failed:`, error);

            const errorMessage = "Lo siento, tuve un problema al analizar tu técnica. ¿Podrías intentar de nuevo?";

            await ctx.runAction(internal.actions.sendWhatsAppMessage, {
              to: fromPhone,
              from: toPhone,
              body: errorMessage,
            });
          }
          return;
        } else if (lowerBody === 'no' || lowerBody === 'incorrecto' || lowerBody === 'nope') {
          console.log(`❌ [${requestId}] User rejected exercise detection`);

          await ctx.runMutation(api.biomechanics.updatePendingConfirmation, {
            phoneNumber: fromPhone,
            waitingForCorrectExercise: true,
          });

          const correctionMessage = "Entendido. ¿Qué ejercicio quisiste hacer?";

          await yourTrainerAgent.saveMessage(ctx, {
            threadId,
            message: {
              role: "assistant",
              content: correctionMessage,
            },
          });

          await ctx.runAction(internal.actions.sendWhatsAppMessage, {
            to: fromPhone,
            from: toPhone,
            body: correctionMessage,
          });

          console.log(`✅ [${requestId}] Correction question sent`);
          return;
        }
      }

      const waitingForCorrection = await ctx.runQuery(
        api.biomechanics.getPendingConfirmationWaitingCorrection,
        { phoneNumber: fromPhone }
      );

      if (waitingForCorrection) {
        const correctedExercise = messageBody;
        console.log(`✅ [${requestId}] User provided correct exercise: ${correctedExercise}`);

        await ctx.runMutation(api.biomechanics.deletePendingConfirmation, {
          phoneNumber: fromPhone,
        });

        ctx.scheduler.runAfter(0, internal.actions.sendWhatsAppMessage, {
          to: fromPhone,
          from: toPhone,
          body: `Perfecto, analizando tu ${correctedExercise}...`,
        });

        try {
          const analysisResult: any = await ctx.runAction(
            (internal as any).biomechanicsInternal.analyzeExerciseTechnique,
            {
              phoneNumber: fromPhone,
              exercise: correctedExercise,
              videoUrl: waitingForCorrection.videoUrl,
              videoStorageId: waitingForCorrection.videoStorageId,
            }
          );

          console.log(`🤖 [${requestId}] Technique analysis completed with corrected exercise`);

          const referenceVideo: any = await ctx.runAction(
            (internal as any).youtubeInternal.getExerciseReferenceVideo,
            {
              exercise: analysisResult.analysis.exercise,
            }
          );

          const formattedResponse = `¡He analizado tu técnica! Aquí está mi evaluación:

**Ejercicio:** ${analysisResult.analysis.exercise}

**Lo que haces bien:**
${analysisResult.analysis.strengths.map((s: string) => `- ${s}`).join('\n')}

${referenceVideo?.videoUrl ? `**📺 Video de referencia (técnica correcta):**
${referenceVideo.videoUrl}

` : ''}**3 cosas para mejorar:**
${analysisResult.analysis.corrections.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

${analysisResult.analysis.regressions && analysisResult.analysis.regressions.length > 0 ? `**Variación más fácil:**
${analysisResult.analysis.regressions.map((r: string) => `- ${r}`).join('\n')}` : ''}

${analysisResult.analysis.progressions && analysisResult.analysis.progressions.length > 0 ? `**Variación más difícil:**
${analysisResult.analysis.progressions.map((p: string) => `- ${p}`).join('\n')}` : ''}

${analysisResult.analysis.riskFactors && analysisResult.analysis.riskFactors.length > 0 ? `**⚠️ Factores de riesgo:**
${analysisResult.analysis.riskFactors.map((rf: string) => `- ${rf}`).join('\n')}` : ''}

────────────────

Perfecto, eso es lo que vi en tu técnica. ¿Quieres que diseñemos un programa completo o revisamos otro ejercicio?`;

          await yourTrainerAgent.saveMessage(ctx, {
            threadId,
            message: {
              role: "assistant",
              content: formattedResponse,
            },
          });

          await ctx.runAction(internal.actions.sendWhatsAppMessage, {
            to: fromPhone,
            from: toPhone,
            body: formattedResponse,
          });

          console.log(`✅ [${requestId}] Analysis response sent`);
        } catch (error) {
          console.error(`❌ [${requestId}] Technique analysis failed:`, error);

          const errorMessage = "Lo siento, tuve un problema al analizar tu técnica. ¿Podrías intentar de nuevo?";

          await ctx.runAction(internal.actions.sendWhatsAppMessage, {
            to: fromPhone,
            from: toPhone,
            body: errorMessage,
          });
        }
        return;
      }

      await yourTrainerAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "user",
          content: messageBody,
        },
      });

      await ctx.runMutation(api.admin.saveAdminMessage, {
        threadId,
        phoneNumber: fromPhone,
        role: "user",
        content: messageBody,
      });

      console.log(`💾 [${requestId}] Message saved to thread`);

      const { text: aiResponse } = await yourTrainerAgent.generateText(ctx, {
        threadId,
        userId: fromPhone,
      }, {
        prompt: messageBody,
      });

      await ctx.runMutation(api.admin.saveAdminMessage, {
        threadId,
        phoneNumber: fromPhone,
        role: "assistant",
        content: aiResponse,
      });

      console.log(`🤖 [${requestId}] AI Response generated: ${aiResponse.substring(0, 50)}...`);

      await ctx.runAction(internal.actions.sendWhatsAppMessage, {
        to: fromPhone,
        from: toPhone,
        body: aiResponse,
      });

      console.log(`✅ [${requestId}] Response sent via Twilio`);
      return;
    }

    console.warn(`⚠️ [${requestId}] UNPROCESSED MESSAGE TYPE`);
  },
});

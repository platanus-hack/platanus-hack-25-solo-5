"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api, internal } from "./_generated/api";

export const analyzeExerciseVideo: any = internalAction({
  args: {
    phoneNumber: v.string(),
    videoUrl: v.string(),
    videoStorageId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🔥 [analyzeExerciseVideo] START', { phoneNumber: args.phoneNumber, videoUrl: args.videoUrl?.substring(0, 50) + '...' });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [analyzeExerciseVideo] User profile not found');
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    console.log('✅ [analyzeExerciseVideo] User profile found', { sex: userProfile.sex, experience: userProfile.experience });

    const analysisPrompt = `Eres un coach biomecánico experto analizando un video de ejercicio. Analiza este video y proporciona una evaluación técnica detallada.

IMPORTANTE: Responde SOLO con JSON válido en ESPAÑOL en exactamente este formato (sin markdown, sin bloques de código, solo JSON puro):

{
  "exercise": "<nombre del ejercicio detectado en ESPAÑOL>",
  "strengths": ["<observación positiva 1 en ESPAÑOL>", "<observación positiva 2 en ESPAÑOL>"],
  "corrections": ["<corrección 1 en ESPAÑOL>", "<corrección 2 en ESPAÑOL>", "<corrección 3 en ESPAÑOL>"],
  "regressions": ["<variación más fácil 1 en ESPAÑOL>"],
  "progressions": ["<variación más difícil 1 en ESPAÑOL>"],
  "riskFactors": ["<factor de riesgo 1 en ESPAÑOL>", "<factor de riesgo 2 en ESPAÑOL>"]
}

Pautas para tu análisis (TODO EN ESPAÑOL):
1. Exercise: Identifica el ejercicio principal (ej: "sentadilla", "peso muerto", "press de banca", "dominadas", "remo", etc.)
2. Strengths: 2-3 observaciones positivas sobre la técnica (lo que está haciendo bien)
3. Corrections: MÁXIMO 3 correcciones con cues simples y accionables (enfócate en lo más importante)
4. Regressions: 1-2 variaciones más fáciles si la técnica necesita mejora
5. Progressions: 1-2 variaciones más difíciles si la técnica es buena
6. Risk Factors: Factores de riesgo que observas (ej: "rodillas en valgo", "espalda redondeada", "rango limitado")

Enfócate en:
- Alineación articular (rodillas, caderas, hombros)
- Rango de movimiento (ROM completo o limitado)
- Control espinal (neutro, extensión, flexión)
- Tempo y control del movimiento
- Simetría bilateral
- Patrones de compensación

Sé honesto pero constructivo. Las correcciones deben ser cues simples que el usuario pueda aplicar inmediatamente. RESPONDE TODO EN ESPAÑOL.

${userProfile.sex ? `Sexo del usuario: ${userProfile.sex}` : ""}
${userProfile.experience ? `Nivel de experiencia: ${userProfile.experience}` : ""}
${userProfile.weight && userProfile.height ? `Stats del usuario: ${userProfile.weight}kg, ${userProfile.height}cm` : ""}`;

    console.log('🔍 [analyzeExerciseVideo] Video URL being sent to Gemini:', args.videoUrl);

    try {
      console.log('📥 [analyzeExerciseVideo] Fetching video from URL...');
      const videoResponse = await fetch(args.videoUrl);
      const videoBuffer = await videoResponse.arrayBuffer();
      const base64Video = Buffer.from(videoBuffer).toString('base64');

      console.log('✅ [analyzeExerciseVideo] Video converted to base64, length:', base64Video.length);

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      console.log('🤖 [analyzeExerciseVideo] Calling Google Gemini 2.5 Pro with official SDK...');
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "video/mp4",
                  data: base64Video,
                },
              },
              { text: analysisPrompt },
            ],
          },
        ],
      });
      const text = result.response.text();

      console.log('✅ [analyzeExerciseVideo] Gemini response received:', text.substring(0, 200) + '...');

      let analysisData;
      try {
        const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        analysisData = JSON.parse(cleanedText);
        console.log('✅ [analyzeExerciseVideo] JSON parsed successfully');
      } catch (parseError) {
        console.error("❌ [analyzeExerciseVideo] Failed to parse Gemini response:", text);
        throw new Error("Failed to parse biomechanical analysis. Please try again.");
      }

      const biomechanicsId: any = await ctx.runMutation(api.biomechanics.saveBiomechanicsAnalysis, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        videoStorageId: args.videoStorageId as any,
        videoUrl: args.videoUrl,
        exercise: analysisData.exercise,
        analysis: {
          strengths: analysisData.strengths,
          corrections: analysisData.corrections,
          regressions: analysisData.regressions,
          progressions: analysisData.progressions,
          riskFactors: analysisData.riskFactors,
        },
        timestamp: Date.now(),
      });

      return {
        success: true,
        biomechanicsId,
        analysis: analysisData,
      };
    } catch (error) {
      console.error("❌ [analyzeExerciseVideo] FATAL ERROR:", error);
      console.error("❌ [analyzeExerciseVideo] Error details:", JSON.stringify(error, null, 2));
      throw new Error(
        `Failed to analyze exercise video: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const analyzeLatestVideo: any = internalAction({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🔥 [analyzeLatestVideo] START', { phoneNumber: args.phoneNumber });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [analyzeLatestVideo] User profile not found');
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    console.log('✅ [analyzeLatestVideo] User profile found:', {
      hasLastVideoUrl: !!userProfile.lastVideoUrl,
      hasLastVideoStorageId: !!userProfile.lastVideoStorageId,
    });

    if (!userProfile.lastVideoUrl || !userProfile.lastVideoStorageId) {
      console.error('❌ [analyzeLatestVideo] No video found in profile');
      throw new Error("No video found. Please send a video of your exercise first.");
    }

    console.log('✅ [analyzeLatestVideo] Found video in profile:', {
      videoUrl: userProfile.lastVideoUrl?.substring(0, 50) + '...',
      videoStorageId: userProfile.lastVideoStorageId,
    });

    console.log('🔄 [analyzeLatestVideo] Calling analyzeExerciseVideo...');
    return await ctx.runAction((internal as any).biomechanicsInternal.analyzeExerciseVideo, {
      phoneNumber: args.phoneNumber,
      videoUrl: userProfile.lastVideoUrl,
      videoStorageId: userProfile.lastVideoStorageId,
    });
  },
});

export const detectExerciseOnly: any = internalAction({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<{ exercise: string }> => {
    console.log('🔥 [detectExerciseOnly] START', { phoneNumber: args.phoneNumber });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [detectExerciseOnly] User profile not found');
      throw new Error("User profile not found");
    }

    if (!userProfile.lastVideoUrl) {
      console.error('❌ [detectExerciseOnly] No video found');
      throw new Error("No video found");
    }

    const detectionPrompt = `Analiza este video de ejercicio e identifica SOLAMENTE qué ejercicio está haciendo la persona.

Responde SOLO con JSON en este formato exacto (sin markdown, sin bloques de código, solo JSON puro):
{
  "exercise": "<nombre del ejercicio en español>"
}

Ejemplos de ejercicios: sentadilla, peso muerto, press de banca, dominadas, remo, curl de bíceps, press militar, press inclinado, zancadas, hip thrust, etc.

Identifica el ejercicio de forma clara y simple.`;

    try {
      console.log('📥 [detectExerciseOnly] Fetching video...');
      const videoResponse = await fetch(userProfile.lastVideoUrl);
      const videoBuffer = await videoResponse.arrayBuffer();
      const base64Video = Buffer.from(videoBuffer).toString('base64');

      console.log('✅ [detectExerciseOnly] Video converted to base64');

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      console.log('🤖 [detectExerciseOnly] Calling Gemini Flash for quick detection...');
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "video/mp4", data: base64Video } },
              { text: detectionPrompt },
            ],
          },
        ],
      });

      const text = result.response.text();
      console.log('✅ [detectExerciseOnly] Gemini response:', text);

      const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
      const data = JSON.parse(cleanedText);

      console.log('✅ [detectExerciseOnly] Exercise detected:', data.exercise);
      return { exercise: data.exercise };
    } catch (error) {
      console.error('❌ [detectExerciseOnly] Error:', error);
      throw new Error(`Failed to detect exercise: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

export const analyzeExerciseTechnique: any = internalAction({
  args: {
    phoneNumber: v.string(),
    exercise: v.string(),
    videoUrl: v.string(),
    videoStorageId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🔥 [analyzeExerciseTechnique] START', { phoneNumber: args.phoneNumber, exercise: args.exercise });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [analyzeExerciseTechnique] User profile not found');
      throw new Error("User profile not found");
    }

    const analysisPrompt = `El usuario está haciendo el ejercicio: ${args.exercise}

Analiza su técnica en detalle y proporciona feedback constructivo.

IMPORTANTE: Responde SOLO con JSON válido en ESPAÑOL (sin markdown, sin bloques de código, solo JSON puro):

{
  "strengths": ["<observación positiva 1>", "<observación positiva 2>"],
  "corrections": ["<corrección 1>", "<corrección 2>", "<corrección 3>"],
  "regressions": ["<variación más fácil 1>"],
  "progressions": ["<variación más difícil 1>"],
  "riskFactors": ["<factor de riesgo 1>", "<factor de riesgo 2>"]
}

Enfócate en:
- Alineación articular (rodillas, caderas, hombros)
- Rango de movimiento (ROM completo o limitado)
- Control espinal (neutro, extensión, flexión)
- Tempo y control del movimiento
- Simetría bilateral
- Patrones de compensación

Máximo 3 correcciones con cues simples y accionables. Sé constructivo pero honesto. RESPONDE TODO EN ESPAÑOL.

${userProfile.sex ? `Sexo: ${userProfile.sex}` : ""}
${userProfile.experience ? `Nivel: ${userProfile.experience}` : ""}
${userProfile.weight && userProfile.height ? `Stats: ${userProfile.weight}kg, ${userProfile.height}cm` : ""}`;

    try {
      console.log('📥 [analyzeExerciseTechnique] Fetching video...');
      const videoResponse = await fetch(args.videoUrl);
      const videoBuffer = await videoResponse.arrayBuffer();
      const base64Video = Buffer.from(videoBuffer).toString('base64');

      console.log('✅ [analyzeExerciseTechnique] Video converted to base64');

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      console.log('🤖 [analyzeExerciseTechnique] Calling Gemini Pro for detailed analysis...');
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "video/mp4", data: base64Video } },
              { text: analysisPrompt },
            ],
          },
        ],
      });

      const text = result.response.text();
      console.log('✅ [analyzeExerciseTechnique] Gemini response received');

      const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
      const analysisData = JSON.parse(cleanedText);

      console.log('✅ [analyzeExerciseTechnique] Analysis parsed successfully');

      const biomechanicsId: any = await ctx.runMutation(api.biomechanics.saveBiomechanicsAnalysis, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        videoStorageId: args.videoStorageId as any,
        videoUrl: args.videoUrl,
        exercise: args.exercise,
        analysis: {
          strengths: analysisData.strengths,
          corrections: analysisData.corrections,
          regressions: analysisData.regressions,
          progressions: analysisData.progressions,
          riskFactors: analysisData.riskFactors,
        },
        timestamp: Date.now(),
      });

      console.log('✅ [analyzeExerciseTechnique] Analysis saved to DB');

      return {
        success: true,
        biomechanicsId,
        analysis: {
          exercise: args.exercise,
          ...analysisData,
        },
      };
    } catch (error) {
      console.error('❌ [analyzeExerciseTechnique] Error:', error);
      throw new Error(`Failed to analyze technique: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { api, internal } from "./_generated/api";

export const analyzeBodyScan: any = internalAction({
  args: {
    phoneNumber: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🔥 [analyzeBodyScan] START', { phoneNumber: args.phoneNumber, imageUrl: args.imageUrl?.substring(0, 50) + '...' });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [analyzeBodyScan] User profile not found');
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    console.log('✅ [analyzeBodyScan] User profile found', { sex: userProfile.sex, age: userProfile.age });

    const analysisPrompt = `Eres un coach de físico experto analizando una foto de composición corporal. Analiza esta imagen y proporciona una evaluación detallada.

IMPORTANTE: Responde SOLO con JSON válido en ESPAÑOL en exactamente este formato (sin markdown, sin bloques de código, solo JSON puro):

{
  "bodyfatPercentage": {
    "min": <número>,
    "max": <número>
  },
  "measurements": {
    "chest": { "min": <número>, "max": <número> },
    "waist": { "min": <número>, "max": <número> },
    "hips": { "min": <número>, "max": <número> },
    "shoulders": { "min": <número>, "max": <número> },
    "arms": { "min": <número>, "max": <número> },
    "thighs": { "min": <número>, "max": <número> },
    "calves": { "min": <número>, "max": <número> }
  },
  "physiqueType": "<descripción en ESPAÑOL del tipo de físico general>",
  "strengths": ["<fortaleza 1 en ESPAÑOL>", "<fortaleza 2 en ESPAÑOL>", "<fortaleza 3 en ESPAÑOL>"],
  "opportunities": ["<oportunidad 1 en ESPAÑOL>", "<oportunidad 2 en ESPAÑOL>", "<oportunidad 3 en ESPAÑOL>"]
}

Pautas para tu análisis (TODO EN ESPAÑOL):
1. Porcentaje de grasa corporal: Proporciona un rango realista (ej: min: 18, max: 22)
2. Medidas: Estima en centímetros con rangos (ej: pecho: 95-100cm)
3. Tipo de físico: Describe la constitución general EN ESPAÑOL (ej: "dominante de tren superior", "atlético delgado", "con grasa localizada", "endomorfo con buena base muscular")
4. Fortalezas: 2-4 observaciones positivas sobre el físico EN ESPAÑOL
5. Oportunidades: 2-4 áreas de mejora o desarrollo EN ESPAÑOL

Sé honesto pero constructivo. Enfócate en insights accionables. Todas las medidas deben ser rangos para reflejar la naturaleza de estimación visual. RESPONDE TODO EN ESPAÑOL.

${userProfile.sex ? `User sex: ${userProfile.sex}` : ""}
${userProfile.age ? `User age: ${userProfile.age}` : ""}
${userProfile.weight && userProfile.height ? `User stats: ${userProfile.weight}kg, ${userProfile.height}cm` : ""}`;

    console.log('🔍 [analyzeBodyScan] Image URL being sent to GPT-4o:', args.imageUrl);
    console.log('🔍 [analyzeBodyScan] User profile:', {
      phoneNumber: args.phoneNumber,
      hasProfile: !!userProfile,
    });

    try {
      console.log('📥 [analyzeBodyScan] Fetching image from URL...');
      const imageResponse = await fetch(args.imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      console.log('✅ [analyzeBodyScan] Image converted to base64, length:', base64Image.length);

      console.log('🤖 [analyzeBodyScan] Calling Google Gemini 2.5 Pro...');
      const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
              },
              {
                type: "image",
                image: `data:image/jpeg;base64,${base64Image}`,
              },
            ],
          },
        ],
        temperature: 0.7,
      });

      console.log('✅ [analyzeBodyScan] Gemini response received:', text.substring(0, 200) + '...');

      let analysisData;
      try {
        const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        analysisData = JSON.parse(cleanedText);
        console.log('✅ [analyzeBodyScan] JSON parsed successfully');
      } catch (parseError) {
        console.error("❌ [analyzeBodyScan] Failed to parse Gemini response:", text);
        throw new Error("Failed to parse body scan analysis. Please try again.");
      }

      const bodyScanId: any = await ctx.runMutation(api.bodyScans.saveBodyScanMutation, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        imageStorageId: args.imageStorageId,
        imageUrl: args.imageUrl,
        analysis: analysisData,
        timestamp: Date.now(),
      });

      return {
        success: true,
        bodyScanId,
        analysis: analysisData,
      };
    } catch (error) {
      console.error("❌ [analyzeBodyScan] FATAL ERROR:", error);
      console.error("❌ [analyzeBodyScan] Error details:", JSON.stringify(error, null, 2));
      throw new Error(
        `Failed to analyze body scan: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const analyzeLatestImage: any = internalAction({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🔥 [analyzeLatestImage] START', { phoneNumber: args.phoneNumber });

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      console.error('❌ [analyzeLatestImage] User profile not found');
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    console.log('✅ [analyzeLatestImage] User profile found:', {
      hasLastImageUrl: !!userProfile.lastImageUrl,
      hasLastImageStorageId: !!userProfile.lastImageStorageId,
    });

    if (!userProfile.lastImageUrl || !userProfile.lastImageStorageId) {
      console.error('❌ [analyzeLatestImage] No image found in profile');
      throw new Error("No image found. Please send a photo of your physique first.");
    }

    console.log('✅ [analyzeLatestImage] Found image in profile:', {
      imageUrl: userProfile.lastImageUrl?.substring(0, 50) + '...',
      imageStorageId: userProfile.lastImageStorageId,
    });

    console.log('🔄 [analyzeLatestImage] Calling analyzeBodyScan...');
    return await ctx.runAction((internal as any).bodyScansInternal.analyzeBodyScan, {
      phoneNumber: args.phoneNumber,
      imageUrl: userProfile.lastImageUrl,
      imageStorageId: userProfile.lastImageStorageId,
    });
  },
});

import { v } from "convex/values";
import { action } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { api } from "./_generated/api";

export const predictProgress: any = action({
  args: {
    phoneNumber: v.string(),
    timeframeWeeks: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const timeframe = args.timeframeWeeks || 8;

    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      throw new Error("Perfil de usuario no encontrado. Por favor completa el onboarding primero.");
    }

    const allBodyScans: any = await ctx.runQuery(api.bodyScans.getUserBodyScans, {
      phoneNumber: args.phoneNumber,
    });

    const allBiomechanics: any = await ctx.runQuery(api.biomechanics.getUserBiomechanics, {
      phoneNumber: args.phoneNumber,
    });

    const latestTrainingPlan: any = await ctx.runQuery(api.trainingPlans.getLatestTrainingPlan, {
      phoneNumber: args.phoneNumber,
    });

    if (!allBodyScans || allBodyScans.length === 0) {
      throw new Error(
        "No hay escaneos corporales disponibles. Por favor envía una foto primero para poder generar predicciones."
      );
    }

    const bodyScanHistory =
      allBodyScans.length > 0
        ? allBodyScans
            .map(
              (scan: any, idx: number) => `
Escaneo ${idx + 1} (${new Date(scan.timestamp).toLocaleDateString("es-ES")}):
- Grasa corporal: ${scan.analysis.bodyfatPercentage.min}-${scan.analysis.bodyfatPercentage.max}%
- Tipo de físico: ${scan.analysis.physiqueType}
- Fortalezas: ${scan.analysis.strengths.join(", ")}
- Oportunidades: ${scan.analysis.opportunities.join(", ")}
${
  scan.analysis.measurements.waist
    ? `- Cintura: ${scan.analysis.measurements.waist.min}-${scan.analysis.measurements.waist.max} cm`
    : ""
}
${
  scan.analysis.measurements.chest
    ? `- Pecho: ${scan.analysis.measurements.chest.min}-${scan.analysis.measurements.chest.max} cm`
    : ""
}`
            )
            .join("\n")
        : "Sin historial de escaneos.";

    const biomechHistory =
      allBiomechanics && allBiomechanics.length > 0
        ? allBiomechanics
            .map(
              (biomech: any) => `
Ejercicio: ${biomech.exercise}
- Fortalezas: ${biomech.analysis.strengths.join(", ")}
- Correcciones: ${biomech.analysis.corrections.join(", ")}
- Factores de riesgo: ${biomech.analysis.riskFactors.join(", ")}`
            )
            .join("\n")
        : "Sin análisis biomecánico disponible.";

    const trainingPlanContext = latestTrainingPlan
      ? `
Plan de Entrenamiento Actual:
- Objetivo: ${latestTrainingPlan.goal}
- Días por semana: ${latestTrainingPlan.daysPerWeek}
- Duración: ${latestTrainingPlan.duration} semanas
- Razón: ${latestTrainingPlan.rationale}`
      : "Sin plan de entrenamiento activo.";

    const predictionPrompt = `Eres un entrenador experto en ciencias del ejercicio y análisis de progreso físico. Tu tarea es predecir el progreso realista de un usuario durante las próximas ${timeframe} semanas.

PERFIL DEL USUARIO:
- Edad: ${userProfile.age || "Desconocida"}
- Sexo: ${userProfile.sex || "Desconocido"}
- Peso: ${userProfile.weight || "Desconocido"} kg
- Altura: ${userProfile.height || "Desconocida"} cm
- Objetivo: ${userProfile.goal || "No especificado"}
- Experiencia: ${userProfile.experience || "No especificada"}
- Días de entrenamiento/semana: ${userProfile.trainingDaysPerWeek || "No especificado"}

HISTORIAL DE ESCANEOS CORPORALES:
${bodyScanHistory}

ANÁLISIS BIOMECÁNICO:
${biomechHistory}

${trainingPlanContext}

TAREA: Basándote en toda esta información, predice de forma REALISTA el progreso que este usuario puede lograr en las próximas ${timeframe} semanas si sigue su plan de entrenamiento y mantiene buenos hábitos.

IMPORTANTE: Debes responder ÚNICAMENTE con JSON válido en exactamente este formato (sin markdown, sin bloques de código, solo JSON puro):

{
  "predictions": {
    "bodyfatChange": {
      "min": <número negativo o positivo>,
      "max": <número negativo o positivo>
    },
    "muscularChanges": "<descripción detallada de qué áreas musculares mostrarán desarrollo visible y cuánto>",
    "strengthProgress": "<descripción cualitativa del progreso de fuerza esperado>",
    "postureProgress": "<descripción de mejoras en postura/simetría basado en análisis biomecánico>",
    "aestheticBalance": "<descripción de cómo mejorará el balance estético general del físico>"
  },
  "assumptions": [
    "<asunción 1: ej. 'Se asume adherencia del 80-90% al plan de entrenamiento'>",
    "<asunción 2: ej. 'Se asume déficit calórico moderado de 300-500 kcal'>",
    "<asunción 3-5: otras asunciones clave>"
  ]
}

GUÍAS PARA LAS PREDICCIONES:

1. **Cambio de grasa corporal (bodyfatChange)**:
   - Pérdida de grasa saludable: -0.5% a -1% por semana
   - Ganancia muscular con mínimo cambio de grasa: -0.2% a +0.2% por semana
   - Recomposición: -0.3% a -0.7% por semana
   - Multiplica por ${timeframe} semanas para el rango total
   - Usa números NEGATIVOS para pérdida, POSITIVOS para ganancia
   - Ejemplo para ${timeframe} semanas de pérdida: {"min": -${timeframe * 1}, "max": -${timeframe * 0.5}}

2. **Cambios musculares (muscularChanges)**:
   - Sé específico sobre QUÉ áreas mostrarán desarrollo
   - Basa esto en el plan de entrenamiento y las oportunidades identificadas en los scans
   - Menciona si serán cambios sutiles o más evidentes
   - Ejemplo: "Desarrollo visible en hombros y espalda superior, especialmente deltoides laterales. Aumento moderado en brazos. Desarrollo inicial de separación en cuádriceps."

3. **Progreso de fuerza (strengthProgress)**:
   - Principiantes: ganancias rápidas (50-100% en algunos lifts)
   - Intermedios: 10-20% de mejora en ${timeframe} semanas
   - Avanzados: 5-10% de mejora
   - Sé cualitativo pero específico
   - Ejemplo: "Mejoras significativas en press de banca (15-25 kg estimados) y sentadilla (20-30 kg). Progreso moderado en ejercicios de tracción."

4. **Progreso de postura (postureProgress)**:
   - Basa esto en los análisis biomecánicos disponibles
   - Si no hay datos biomecánicos, di "No hay datos suficientes para predecir cambios posturales específicos"
   - Si hay datos, menciona correcciones específicas que mejorarán
   - Ejemplo: "Mejora en protracción escapular durante el press. Reducción de valgus de rodilla en sentadillas."

5. **Balance estético (aestheticBalance)**:
   - Describe cómo el físico se volverá más balanceado
   - Menciona proporciones que mejorarán
   - Ejemplo: "Mejor relación hombro-cintura. Desarrollo más equilibrado entre tren superior e inferior."

6. **Asunciones (assumptions)**:
   - Lista 3-5 asunciones clave para que las predicciones sean válidas
   - Incluye siempre: adherencia al plan, nutrición adecuada, descanso suficiente
   - Sé específico con los porcentajes y números
   - Ejemplo: "Se asume adherencia del 85-95% al plan de entrenamiento", "Se asume consumo proteico de 1.6-2.2 g/kg"

IMPORTANTE:
- Usa SOLO rangos realistas basados en ciencia del ejercicio
- NO prometas resultados extremos o poco realistas
- Si faltan datos clave, menciónalo en las asunciones
- Sé conservador pero motivador
- Todas las descripciones deben ser en ESPAÑOL

Genera ahora las predicciones para ${timeframe} semanas.`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        messages: [
          {
            role: "user",
            content: predictionPrompt,
          },
        ],
        temperature: 0.7,
      });

      let predictionData;
      try {
        const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        predictionData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse GPT-4 prediction response:", text);
        throw new Error("Error al procesar la predicción. Por favor intenta de nuevo.");
      }

      const scanIds = allBodyScans.map((scan: any) => scan._id);
      const biomechIds = allBiomechanics ? allBiomechanics.map((b: any) => b._id) : [];

      const predictionId: any = await ctx.runMutation(api.predictions.savePredictionMutation, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        basedOnScans: scanIds,
        basedOnBiomech: biomechIds,
        timeframe,
        predictions: predictionData.predictions,
        assumptions: predictionData.assumptions,
        timestamp: Date.now(),
      });

      const formattedResponse = `🔮 Predicción de Progreso - ${timeframe} Semanas

Si sigues tu plan durante las próximas ${timeframe} semanas…

📉 Cambio en grasa corporal: ${predictionData.predictions.bodyfatChange.min > 0 ? "+" : ""}${predictionData.predictions.bodyfatChange.min}% a ${predictionData.predictions.bodyfatChange.max > 0 ? "+" : ""}${predictionData.predictions.bodyfatChange.max}%

💪 Cambios musculares visibles:
${predictionData.predictions.muscularChanges}

🏋️ Progreso de fuerza:
${predictionData.predictions.strengthProgress}

🧘 Progreso de postura/simetría:
${predictionData.predictions.postureProgress}

✨ Balance estético:
${predictionData.predictions.aestheticBalance}

⚠️ Asunciones clave:
${predictionData.assumptions.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

Descargo: Esto es una estimación basada en tu historial y datos actuales, no una garantía. Los resultados reales dependerán de tu adherencia, nutrición, descanso y otros factores individuales.`;

      return {
        success: true,
        predictionId,
        prediction: predictionData,
        formattedResponse,
      };
    } catch (error) {
      console.error("Error generating prediction:", error);
      throw new Error(
        `Error al generar predicción: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  },
});

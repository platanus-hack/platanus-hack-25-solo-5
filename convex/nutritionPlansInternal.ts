import { v } from "convex/values";
import { action } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { api } from "./_generated/api";

export const generateNutritionPlan: any = action({
  args: {
    phoneNumber: v.string(),
    culturalPreference: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      throw new Error("Perfil de usuario no encontrado. Por favor completa el onboarding primero.");
    }

    const latestBodyScan: any = await ctx.runQuery(api.bodyScans.getLatestBodyScan, {
      phoneNumber: args.phoneNumber,
    });

    if (!latestBodyScan) {
      throw new Error(
        "No hay escaneos corporales disponibles. Por favor envía una foto primero para poder calcular tu plan nutricional."
      );
    }

    const latestTrainingPlan: any = await ctx.runQuery(api.trainingPlans.getLatestTrainingPlan, {
      phoneNumber: args.phoneNumber,
    });

    const trainingDaysPerWeek = latestTrainingPlan
      ? latestTrainingPlan.daysPerWeek
      : userProfile.trainingDaysPerWeek || 3;

    const culturalContext =
      args.culturalPreference ||
      (args.phoneNumber.startsWith("+56")
        ? "chilena"
        : args.phoneNumber.startsWith("+52")
          ? "mexicana"
          : args.phoneNumber.startsWith("+54")
            ? "argentina"
            : args.phoneNumber.startsWith("+57")
              ? "colombiana"
              : args.phoneNumber.startsWith("+51")
                ? "peruana"
                : args.phoneNumber.startsWith("+34")
                  ? "española"
                  : "latinoamericana");

    const avgBodyfat =
      (latestBodyScan.analysis.bodyfatPercentage.min +
        latestBodyScan.analysis.bodyfatPercentage.max) /
      2;

    const estimatedWeight = userProfile.weight || 70;

    const bodyScanContext = `
Análisis Corporal Reciente:
- Grasa corporal: ${latestBodyScan.analysis.bodyfatPercentage.min}-${latestBodyScan.analysis.bodyfatPercentage.max}% (promedio: ${avgBodyfat.toFixed(1)}%)
- Tipo de físico: ${latestBodyScan.analysis.physiqueType}
- Peso estimado: ${estimatedWeight} kg
${latestBodyScan.analysis.measurements.waist ? `- Cintura: ${latestBodyScan.analysis.measurements.waist.min}-${latestBodyScan.analysis.measurements.waist.max} cm` : ""}`;

    const trainingContext = latestTrainingPlan
      ? `
Plan de Entrenamiento:
- Días de entrenamiento: ${trainingDaysPerWeek} días/semana
- Objetivo: ${latestTrainingPlan.goal}
- Duración: ${latestTrainingPlan.duration} semanas`
      : `
Plan de Entrenamiento:
- Días de entrenamiento: ${trainingDaysPerWeek} días/semana (estimado)
- Sin plan de entrenamiento formal todavía`;

    const nutritionPrompt = `Eres un nutricionista deportivo experto. Tu tarea es diseñar un plan nutricional personalizado y culturalmente apropiado para este usuario.

PERFIL DEL USUARIO:
- Edad: ${userProfile.age || "Desconocida"}
- Sexo: ${userProfile.sex || "Desconocido"}
- Peso: ${estimatedWeight} kg
- Altura: ${userProfile.height || "Desconocida"} cm
- Objetivo: ${userProfile.goal || "No especificado"}
- Experiencia: ${userProfile.experience || "No especificada"}

${bodyScanContext}

${trainingContext}

CONTEXTO CULTURAL: ${culturalContext}

IMPORTANTE: Responde ÚNICAMENTE con JSON válido en este formato exacto (sin markdown, sin bloques de código):

{
  "macrosTrainingDays": {
    "calories": <número>,
    "protein": <número en gramos>,
    "carbs": <número en gramos>,
    "fats": <número en gramos>
  },
  "macrosRestDays": {
    "calories": <número>,
    "protein": <número en gramos>,
    "carbs": <número en gramos>,
    "fats": <número en gramos>
  },
  "mealExamples": [
    {
      "dayType": "training",
      "meals": [
        {
          "mealTime": "Desayuno",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": {
            "protein": <número>,
            "carbs": <número>,
            "fats": <número>,
            "calories": <número>
          }
        },
        {
          "mealTime": "Almuerzo",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        },
        {
          "mealTime": "Cena",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        },
        {
          "mealTime": "Snack Post-Entrenamiento",
          "foods": ["alimento 1", "alimento 2"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        }
      ]
    },
    {
      "dayType": "rest",
      "meals": [
        {
          "mealTime": "Desayuno",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        },
        {
          "mealTime": "Almuerzo",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        },
        {
          "mealTime": "Cena",
          "foods": ["alimento 1", "alimento 2", "alimento 3"],
          "macros": { "protein": <número>, "carbs": <número>, "fats": <número>, "calories": <número> }
        }
      ]
    }
  ],
  "rationale": "<2-3 oraciones explicando por qué este plan funciona para este usuario específico>"
}

GUÍAS PARA EL CÁLCULO DE MACROS:

1. **Calorías Base (TDEE):**
   - Hombres: peso_kg × (24-26 si sedentario, 28-30 si activo, 32-36 si muy activo)
   - Mujeres: peso_kg × (22-24 si sedentaria, 26-28 si activa, 30-34 si muy activa)
   - Ajusta según grasa corporal: mayor bodyfat → usar multiplicador más bajo

2. **Ajuste por Objetivo:**
   - Pérdida de grasa: déficit de 300-500 kcal (TDEE - 400)
   - Ganancia muscular: superávit de 200-400 kcal (TDEE + 300)
   - Mantenimiento/recomposición: TDEE ± 100 kcal
   - Definición/estética: déficit de 200-400 kcal (TDEE - 300)

3. **Distribución de Macros:**
   - Proteína: 1.8-2.4 g/kg de peso corporal (SIEMPRE)
   - Grasas: 25-35% de calorías totales (0.8-1.2 g/kg mínimo)
   - Carbohidratos: El resto de calorías

4. **Diferencia Training vs Rest Days:**
   - Días de entrenamiento: 10-20% más calorías, principalmente de carbohidratos
   - Días de descanso: 10-20% menos calorías, reducir carbohidratos principalmente
   - Proteína se mantiene igual en ambos días
   - Ejemplo: Si TDEE ajustado es 2200 kcal → Training: 2400 kcal, Rest: 2000 kcal

5. **Alimentos Culturalmente Apropiados:**

   **Chilena:**
   - Proteínas: pollo, pavo, atún, huevos, legumbres, queso fresco
   - Carbos: pan integral, arroz, avena, papa, quinoa, choclo
   - Grasas: palta, aceite de oliva, frutos secos
   - Típico: cazuela de ave (baja en grasa), porotos con arroz integral, ensalada chilena

   **Mexicana:**
   - Proteínas: pollo, pescado, frijoles negros, huevos, requesón
   - Carbos: tortillas de maíz, arroz integral, frijoles, nopales, camote
   - Grasas: aguacate, semillas de calabaza, aceite de oliva
   - Típico: tacos de pollo con tortilla de maíz, frijoles de la olla, nopales asados

   **Argentina:**
   - Proteínas: carne magra, pollo, huevos, queso fresco
   - Carbos: pan integral, arroz, papa, batata, polenta
   - Grasas: aceite de oliva, frutos secos, aguacate
   - Típico: bife de lomo a la plancha, ensalada mixta, batata al horno

   **Colombiana:**
   - Proteínas: pollo, pescado, frijoles, huevos, queso
   - Carbos: arroz integral, arepa integral, plátano, yuca
   - Grasas: aguacate, aceite de oliva, nueces
   - Típico: bandeja fitness (arroz, frijoles, carne magra, aguacate, ensalada)

   **Peruana:**
   - Proteínas: pescado, pollo, quinoa, huevos, legumbres
   - Carbos: quinoa, arroz integral, camote, papa, choclo
   - Grasas: palta, aceite de oliva, frutos secos
   - Típico: ceviche, arroz con pollo (versión fitness), quinoa con verduras

   **Española:**
   - Proteínas: pescado, pollo, pavo, huevos, legumbres
   - Carbos: pan integral, arroz, pasta integral, patata, garbanzos
   - Grasas: aceite de oliva, frutos secos, aguacate
   - Típico: tortilla de patatas fitness, ensalada mediterránea, pescado a la plancha

   **Latinoamericana general:**
   - Proteínas: pollo, pescado, huevos, frijoles, lentejas
   - Carbos: arroz integral, tortillas, pan integral, plátano, camote
   - Grasas: aguacate, aceite de oliva, frutos secos

6. **Estructura de Comidas:**
   - Desayuno: 25-30% de calorías
   - Almuerzo: 35-40% de calorías
   - Cena: 25-30% de calorías
   - Snacks: 10-15% de calorías
   - En días de entrenamiento: agregar snack post-entrenamiento con proteína + carbos rápidos

7. **Cantidades Aproximadas (usa estas como referencia):**
   - 100g pollo/pescado = ~25g proteína, ~120 kcal
   - 1 huevo grande = ~6g proteína, ~70 kcal
   - 1 taza arroz cocido = ~45g carbos, ~200 kcal
   - 1 aguacate mediano = ~20g grasas, ~200 kcal
   - 1 cucharada aceite = ~14g grasas, ~120 kcal

IMPORTANTE:
- Los alimentos DEBEN ser típicos y accesibles en la cultura especificada
- Las cantidades deben ser realistas y prácticas
- Los macros de cada comida deben sumar correctamente a los macros totales del día
- Sé específico con los alimentos (no solo "proteína", sino "pechuga de pollo a la plancha 150g")
- Incluye porciones aproximadas (150g, 1 taza, 2 cucharadas, etc.)

Genera ahora el plan nutricional completo.`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        messages: [
          {
            role: "user",
            content: nutritionPrompt,
          },
        ],
        temperature: 0.7,
      });

      let nutritionData;
      try {
        const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        nutritionData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse GPT-4 nutrition response:", text);
        throw new Error("Error al procesar el plan nutricional. Por favor intenta de nuevo.");
      }

      const nutritionPlanId: any = await ctx.runMutation(api.nutritionPlans.saveNutritionPlanMutation, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        basedOnScan: latestBodyScan._id,
        basedOnTrainingPlan: latestTrainingPlan?._id,
        goal: userProfile.goal || "general",
        macrosTrainingDays: nutritionData.macrosTrainingDays,
        macrosRestDays: nutritionData.macrosRestDays,
        mealExamples: nutritionData.mealExamples,
        culturalContext: culturalContext,
        rationale: nutritionData.rationale,
        timestamp: Date.now(),
      });

      const trainingDayExample = nutritionData.mealExamples.find((day: any) => day.dayType === "training");
      const restDayExample = nutritionData.mealExamples.find((day: any) => day.dayType === "rest");

      const formatMeals = (meals: any[]) => {
        return meals
          .map(
            (meal: any) =>
              `**${meal.mealTime}**\n${meal.foods.map((food: string) => `• ${food}`).join("\n")}\n📊 P: ${meal.macros.protein}g | C: ${meal.macros.carbs}g | G: ${meal.macros.fats}g | Cal: ${meal.macros.calories}`
          )
          .join("\n\n");
      };

      const formattedResponse = `🍽️ Tu Plan Nutricional Personalizado

📊 **MACROS - DÍAS DE ENTRENAMIENTO** (${trainingDaysPerWeek} días/semana)
• Calorías: ${nutritionData.macrosTrainingDays.calories} kcal
• Proteína: ${nutritionData.macrosTrainingDays.protein}g
• Carbohidratos: ${nutritionData.macrosTrainingDays.carbs}g
• Grasas: ${nutritionData.macrosTrainingDays.fats}g

📊 **MACROS - DÍAS DE DESCANSO**
• Calorías: ${nutritionData.macrosRestDays.calories} kcal
• Proteína: ${nutritionData.macrosRestDays.protein}g
• Carbohidratos: ${nutritionData.macrosRestDays.carbs}g
• Grasas: ${nutritionData.macrosRestDays.fats}g

────────────────

🥗 **EJEMPLO - DÍA DE ENTRENAMIENTO**

${formatMeals(trainingDayExample.meals)}

────────────────

🥗 **EJEMPLO - DÍA DE DESCANSO**

${formatMeals(restDayExample.meals)}

────────────────

💡 **Por qué funciona este plan:**
${nutritionData.rationale}

────────────────

⚠️ **DESCARGO IMPORTANTE:**
Este plan nutricional es una guía educativa basada en tu perfil y objetivos. NO reemplaza la consulta con un nutricionista certificado o médico especializado en nutrición.

Para resultados óptimos y seguros, especialmente si tienes condiciones médicas, alergias, o necesitas un plan más detallado, te recomendamos consultar con un profesional de la salud.

El plan está adaptado a ingredientes y costumbres de la gastronomía ${culturalContext}, pero puedes hacer sustituciones según tu preferencia y disponibilidad.`;

      return {
        success: true,
        nutritionPlanId,
        plan: nutritionData,
        formattedResponse,
      };
    } catch (error) {
      console.error("Error generating nutrition plan:", error);
      throw new Error(
        `Error al generar plan nutricional: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  },
});

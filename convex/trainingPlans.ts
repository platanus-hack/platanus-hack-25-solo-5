import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { api } from "./_generated/api";

export const generateTrainingPlan: any = action({
  args: {
    phoneNumber: v.string(),
    daysPerWeek: v.number(),
    goal: v.string(),
    equipment: v.array(v.string()),
    experience: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    focusAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<any> => {
    const userProfile: any = await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: args.phoneNumber,
    });

    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    const latestBodyScan = await ctx.runQuery(api.bodyScans.getLatestBodyScan, {
      phoneNumber: args.phoneNumber,
    });

    const bodyScanContext = latestBodyScan
      ? `
Recent Body Scan Data:
- Bodyfat: ${latestBodyScan.analysis.bodyfatPercentage.min}-${latestBodyScan.analysis.bodyfatPercentage.max}%
- Physique Type: ${latestBodyScan.analysis.physiqueType}
- Strengths: ${latestBodyScan.analysis.strengths.join(", ")}
- Opportunities: ${latestBodyScan.analysis.opportunities.join(", ")}`
      : "No body scan data available yet.";

    const planPrompt = `You are an expert strength and conditioning coach designing a personalized training program.

USER PROFILE:
- Age: ${userProfile.age || "Unknown"}
- Sex: ${userProfile.sex || "Unknown"}
- Weight: ${userProfile.weight || "Unknown"} kg
- Height: ${userProfile.height || "Unknown"} cm
- Experience Level: ${args.experience}
- Training Days Per Week: ${args.daysPerWeek}
- Primary Goal: ${args.goal}
- Equipment Available: ${args.equipment.join(", ")}
${args.focusAreas ? `- Focus Areas: ${args.focusAreas.join(", ")}` : ""}

${bodyScanContext}

TASK: Design a ${args.daysPerWeek}-day per week training program for ${4}-${6} weeks based on this user's profile and goals.

IMPORTANT: Respond ONLY with valid JSON in exactly this format (no markdown, no code blocks, just raw JSON):

{
  "duration": <number of weeks, 4-6>,
  "daysPerWeek": ${args.daysPerWeek},
  "goal": "${args.goal}",
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "focus": "<e.g., 'Upper Body - Chest & Back'>",
          "exercises": [
            {
              "name": "<exercise name>",
              "sets": <number>,
              "reps": "<e.g., '8-10' or '12-15'>",
              "rest": "<e.g., '90s' or '2min'>",
              "rpe": "<optional, e.g., '7-8'>",
              "notes": "<optional coaching cues>"
            }
          ]
        }
      ]
    }
  ],
  "rationale": "<2-3 sentences explaining why this program works for this user's specific situation, goals, and body scan insights>"
}

GUIDELINES:
1. **Periodization**: Structure the program with appropriate progression over 4-6 weeks
2. **Exercise Selection**:
   - Choose exercises based on available equipment
   - Match exercise difficulty to experience level
   - Address body scan opportunities if data available
   - Include 5-8 exercises per workout
3. **Sets & Reps**:
   - Hypertrophy: 3-4 sets, 8-12 reps
   - Strength: 4-5 sets, 4-6 reps
   - Fat loss: 3-4 sets, 10-15 reps with shorter rest
   - Endurance: 2-3 sets, 15-20 reps
4. **Rest Periods**:
   - Compound lifts: 2-3 minutes
   - Isolation: 60-90 seconds
   - Circuits/fat loss: 30-60 seconds
5. **RPE/RIR**: Include for intermediate/advanced lifters
6. **Progression**: Week 1-2 (accumulation), Week 3-4 (intensification), Week 5-6 (peak/deload)
7. **Recovery**: Consider training frequency and exercise selection for adequate recovery
8. **Safety**: Include warm-up recommendations in notes where appropriate

For ${args.daysPerWeek} days per week:
${args.daysPerWeek === 3 ? "- Full body splits work well\n- Day 1: Push emphasis\n- Day 2: Pull emphasis\n- Day 3: Legs emphasis" : ""}
${args.daysPerWeek === 4 ? "- Upper/Lower split recommended\n- Day 1: Upper (Push)\n- Day 2: Lower (Quad)\n- Day 3: Upper (Pull)\n- Day 4: Lower (Hip/Glute)" : ""}
${args.daysPerWeek === 5 ? "- Push/Pull/Legs split or Upper/Lower with accessory day\n- Flexible structure based on goals" : ""}
${args.daysPerWeek === 6 ? "- Push/Pull/Legs twice per week\n- Or specialized splits based on goals" : ""}

RATIONALE TIPS:
- Reference specific body scan insights if available
- Explain how exercise selection matches their equipment and experience
- Connect program structure to their stated goal
- Mention progression strategy

Generate a complete ${args.daysPerWeek}-day program for ${4}-${6} weeks now.`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        messages: [
          {
            role: "user",
            content: planPrompt,
          },
        ],
        temperature: 0.8,
      });

      let planData;
      try {
        const cleanedText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        planData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse GPT-4 response:", text);
        throw new Error("Failed to parse training plan. Please try again.");
      }

      const trainingPlanId: any = await ctx.runMutation(api.trainingPlans.saveTrainingPlanMutation, {
        userId: userProfile._id,
        phoneNumber: args.phoneNumber,
        startDate: Date.now(),
        duration: planData.duration,
        daysPerWeek: args.daysPerWeek,
        goal: args.goal,
        weeks: planData.weeks,
        rationale: planData.rationale,
        timestamp: Date.now(),
      });

      return {
        success: true,
        trainingPlanId,
        plan: planData,
      };
    } catch (error) {
      console.error("Error generating training plan:", error);
      throw new Error(
        `Failed to generate training plan: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const saveTrainingPlanMutation = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    startDate: v.number(),
    duration: v.number(),
    daysPerWeek: v.number(),
    goal: v.string(),
    weeks: v.any(),
    rationale: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const trainingPlanId = await ctx.db.insert("trainingPlans", args);
    return trainingPlanId;
  },
});

export const getUserTrainingPlans = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("trainingPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getLatestTrainingPlan = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainingPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();
  },
});

export const getTrainingPlanById = query({
  args: {
    planId: v.id("trainingPlans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

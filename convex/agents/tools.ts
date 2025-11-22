import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api, internal } from "../_generated/api";

export const getUserProfileTool: any = createTool({
  description: `Get the user's profile data including age, weight, height, goals, experience level, equipment, and training days per week.

Use this tool:
- At the start of any conversation to check if the user has a complete profile
- To retrieve user data before generating training plans or giving personalized advice
- To check onboarding completion status

Returns the user's profile or null if no profile exists yet.`,

  args: z.object({}),

  handler: async (ctx, args): Promise<any> => {
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    return await ctx.runQuery(api.userProfiles.getUserProfile, {
      phoneNumber: ctx.userId,
    });
  },
});

export const updateUserProfileTool: any = createTool({
  description: `Update the user's profile with new information collected during onboarding or conversation.

Use this tool:
- When the user provides their age, weight, height, goals, or other profile data
- During the onboarding process to save each piece of information
- When the user updates their goals or training availability
- To mark onboarding as completed when all required fields are collected

All fields are optional - only update the fields being provided.`,

  args: z.object({
    age: z.number().optional(),
    sex: z.enum(["male", "female", "other"]).optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    goal: z.string().optional(),
    experience: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    equipment: z.array(z.string()).optional(),
    trainingDaysPerWeek: z.number().optional(),
    onboardingCompleted: z.boolean().optional(),
  }),

  handler: async (ctx, args) => {
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    return await ctx.runMutation(api.userProfiles.updateUserProfile, {
      phoneNumber: ctx.userId,
      ...args,
    });
  },
});

export const analyzeBodyScanTool: any = createTool({
  description: `Analyze a physique photo using GPT-4 Vision to estimate body composition and provide coaching insights.

Use this tool when:
- The user sends a photo of their physique (front, back, or side view)
- The user asks for a body composition analysis
- The user wants to track their progress with a new photo
- The user has just sent an image in the conversation

The tool will automatically find the most recent image sent by the user and analyze it.

The analysis returns:
- Bodyfat percentage (as a range, e.g., 18-22%)
- Measurements estimates (chest, waist, hips, shoulders, arms, thighs, calves - all as ranges in cm)
- Physique type classification (e.g., "upper-body dominant", "lean athletic", "skinny-fat")
- Strengths (2-4 positive observations)
- Opportunities for improvement (2-4 areas to focus on)

IMPORTANT: Only use this tool when the user has actually sent an image in the conversation. The tool will find and analyze the most recent image automatically.`,

  args: z.object({
    imageUrl: z.string().optional(),
    imageStorageId: z.string().optional(),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [analyzeBodyScanTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      if (args.imageUrl && args.imageStorageId) {
        console.log('🎯 [analyzeBodyScanTool] Using provided image URL');
        return await ctx.runAction((internal as any).bodyScansInternal.analyzeBodyScan, {
          phoneNumber: ctx.userId,
          imageUrl: args.imageUrl,
          imageStorageId: args.imageStorageId,
        });
      } else {
        console.log('🎯 [analyzeBodyScanTool] Analyzing latest image from profile');
        return await ctx.runAction((internal as any).bodyScansInternal.analyzeLatestImage, {
          phoneNumber: ctx.userId,
        });
      }
    } catch (error) {
      console.error('❌ [analyzeBodyScanTool] ERROR:', error);
      throw error;
    }
  },
});

export const generateTrainingPlanTool: any = createTool({
  description: `Generate a personalized, periodized training plan based on the user's profile, goals, and available resources.

Use this tool when:
- The user asks for a workout plan or training program
- The user wants to start training or needs a new program
- The user has completed onboarding and you have all necessary data (days/week, equipment, experience, goals)

The tool requires:
- User's profile must be complete (check with getUserProfile first)
- Training days per week (3-6 days typically)
- Equipment available
- Experience level
- Primary goal

The tool will generate:
- A 4-6 week training block
- Day-by-day workout structure
- Exercise selection with sets, reps, rest periods
- RPE/RIR guidance
- Clear rationale explaining why this plan works for the user

DO NOT use this tool if the user's profile is incomplete - gather missing data first.`,

  args: z.object({
    daysPerWeek: z.number(),
    goal: z.string(),
    equipment: z.array(z.string()),
    experience: z.enum(["beginner", "intermediate", "advanced"]),
    focusAreas: z.array(z.string()).optional(),
  }),

  handler: async (ctx, args) => {
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    return await ctx.runAction((api.trainingPlans as any).generateTrainingPlan, {
      phoneNumber: ctx.userId,
      daysPerWeek: args.daysPerWeek,
      goal: args.goal,
      equipment: args.equipment,
      experience: args.experience,
      focusAreas: args.focusAreas,
    });
  },
});

export const analyzeBiomechanicsTool: any = createTool({
  description: `Analyze an exercise technique video using AI vision to provide biomechanical feedback and form corrections.

Use this tool when:
- The user sends a video of themselves performing an exercise
- The user asks for a technique check or form analysis
- The user wants feedback on their exercise execution
- The user has just sent a video in the conversation

The tool will automatically find the most recent video sent by the user and analyze it.

The analysis returns:
- Exercise type detected (squat, deadlift, bench press, etc.)
- Strengths (2-3 positive observations about technique)
- Corrections (maximum 3 simple, actionable cues to improve form)
- Regressions (1-2 easier variations if technique needs work)
- Progressions (1-2 harder variations if technique is good)
- Risk Factors (biomechanical risks observed)

IMPORTANT: Only use this tool when the user has actually sent a video in the conversation. The tool will find and analyze the most recent video automatically.`,

  args: z.object({
    videoUrl: z.string().optional(),
    videoStorageId: z.string().optional(),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [analyzeBiomechanicsTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      if (args.videoUrl && args.videoStorageId) {
        console.log('🎯 [analyzeBiomechanicsTool] Using provided video URL');
        return await ctx.runAction((internal as any).biomechanicsInternal.analyzeExerciseVideo, {
          phoneNumber: ctx.userId,
          videoUrl: args.videoUrl,
          videoStorageId: args.videoStorageId,
        });
      } else {
        console.log('🎯 [analyzeBiomechanicsTool] Analyzing latest video from profile');
        return await ctx.runAction((internal as any).biomechanicsInternal.analyzeLatestVideo, {
          phoneNumber: ctx.userId,
        });
      }
    } catch (error) {
      console.error('❌ [analyzeBiomechanicsTool] ERROR:', error);
      throw error;
    }
  },
});

export const predictProgressTool: any = createTool({
  description: `Predict realistic physique and performance progress for the user over a specified timeframe (default 8 weeks).

Use this tool when:
- The user asks "how will I look in X weeks?"
- The user asks for progress predictions or projections
- The user wants to know what results to expect from their training
- The user asks "what can I achieve in X weeks?"
- The user asks for a forecast of their physique development

The tool requires:
- At least one body scan in the user's history (required)
- User profile data (for better predictions)
- Training plan data (if available, for more accurate predictions)
- Biomechanical analysis data (if available, for posture/form predictions)

The prediction returns:
- Bodyfat percentage change (as a range, e.g., -4% to -2%)
- Muscular changes description (which areas will develop visibly)
- Strength progress description (qualitative improvements expected)
- Posture/symmetry improvements (based on biomechanical data if available)
- Aesthetic balance improvements (overall physique development)
- Assumptions list (what must be true for predictions to be accurate)

IMPORTANT: This tool will NOT work if the user has no body scans. Check their history first with getUserProfile and verify they have at least one scan before using this tool.

Default timeframe: 8 weeks (can be customized with timeframeWeeks parameter).`,

  args: z.object({
    timeframeWeeks: z.number().optional(),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [predictProgressTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      return await ctx.runAction((internal as any).predictionsInternal.predictProgress, {
        phoneNumber: ctx.userId,
        timeframeWeeks: args.timeframeWeeks || 8,
      });
    } catch (error) {
      console.error('❌ [predictProgressTool] ERROR:', error);
      throw error;
    }
  },
});

export const generateNutritionPlanTool: any = createTool({
  description: `Generate a personalized nutrition plan with macros and culturally-appropriate meal examples.

Use this tool when:
- The user asks for a nutrition plan, meal plan, or diet plan
- The user asks "what should I eat?"
- The user wants to know their macros or calorie targets
- The user asks for meal examples or food recommendations
- The user needs nutritional guidance to achieve their goals

The tool requires:
- At least one body scan (required to calculate macros based on bodyfat and physique)
- User profile with goals
- Training plan (if available, to adjust macros for training vs rest days)

The nutrition plan includes:
- Macros for training days (calories, protein, carbs, fats)
- Macros for rest days (10-20% lower calories, mainly from carbs)
- Full meal examples for both training and rest days
- Foods culturally appropriate to the user's region/country
- Specific portions and quantities
- Macro breakdown for each meal
- Rationale explaining why this plan works
- Medical disclaimer (not a replacement for professional nutrition advice)

Cultural adaptation:
- Automatically detects culture from phone number (Chilean, Mexican, Argentine, Colombian, Peruvian, Spanish, etc.)
- Can be overridden with culturalPreference parameter
- Uses locally available and traditional foods

IMPORTANT:
- User MUST have at least one body scan for calculations
- Always include medical disclaimer that this is educational guidance
- Encourage users to consult certified nutritionist for personalized advice
- Plan adjusts for training days (higher calories/carbs) vs rest days (lower calories/carbs)`,

  args: z.object({
    culturalPreference: z.string().optional(),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [generateNutritionPlanTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      return await ctx.runAction((internal as any).nutritionPlansInternal.generateNutritionPlan, {
        phoneNumber: ctx.userId,
        culturalPreference: args.culturalPreference,
      });
    } catch (error) {
      console.error('❌ [generateNutritionPlanTool] ERROR:', error);
      throw error;
    }
  },
});

export const logWorkoutTool: any = createTool({
  description: `Log a completed workout session with exercises, sets, reps, and weight. This tool automatically checks for new Personal Records (PRs).

Use this tool when:
- The user mentions they completed a workout (e.g., "Hice bench press 100kg x 5 reps")
- The user naturally describes exercises they performed with weight and reps
- The user says they finished training or completed a session
- The user provides workout data in conversational language

The tool expects:
- Exercise names (can be in Spanish or English)
- Sets with reps and weight for each exercise
- Optional: RPE (Rate of Perceived Exertion 1-10), notes

After logging the workout, the tool will:
- Save the workout session to the database
- Automatically check for new PRs across all 4 types: 1RM, Max Reps, Max Volume, Best Set
- Return any new PRs achieved so you can celebrate them immediately

IMPORTANT:
- Before calling this tool, confirm the workout details with the user
- Exercise names will be automatically normalized for consistent tracking
- ALWAYS celebrate new PRs enthusiastically when they are achieved
- If no PRs were broken, still acknowledge the good work

Response format after logging:
1. Confirm the workout was saved
2. If new PRs were achieved, celebrate them with details (what type of PR, new value, improvement %)
3. If no new PRs, acknowledge the workout and encourage continued progress`,

  args: z.object({
    exercises: z.array(
      z.object({
        name: z.string().describe("Exercise name in Spanish or English"),
        sets: z.array(
          z.object({
            reps: z.number().describe("Number of repetitions"),
            weight: z.number().describe("Weight in kilograms"),
            rpe: z.number().min(1).max(10).optional().describe("Rate of Perceived Exertion (1-10)"),
            notes: z.string().optional().describe("Optional notes about this set"),
          })
        ),
      })
    ),
    date: z.number().optional().describe("Timestamp of the workout (defaults to now)"),
    duration: z.number().optional().describe("Duration of the workout in minutes"),
    notes: z.string().optional().describe("General notes about the workout session"),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [logWorkoutTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const userProfile = await ctx.runQuery(api.userProfiles.getUserProfile, {
        phoneNumber: ctx.userId,
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const { normalizeExerciseName } = await import("../helpers/exerciseNormalizer");

      const normalizedExercises = args.exercises.map((exercise: any) => ({
        name: exercise.name,
        normalizedName: normalizeExerciseName(exercise.name),
        sets: exercise.sets.map((set: any, index: number) => ({
          setNumber: index + 1,
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe,
          notes: set.notes,
        })),
      }));

      const workoutSessionId = await ctx.runMutation(api.workoutSessions.logWorkoutSession, {
        phoneNumber: ctx.userId,
        userId: userProfile._id,
        date: args.date || Date.now(),
        exercises: normalizedExercises,
        duration: args.duration,
        notes: args.notes,
      });

      const allNewPRs: any[] = [];

      for (const exercise of normalizedExercises) {
        const prResult = await ctx.runMutation(api.personalRecords.checkAndUpdatePRs, {
          userId: userProfile._id,
          phoneNumber: ctx.userId,
          workoutSessionId,
          exerciseName: exercise.name,
          normalizedName: exercise.normalizedName,
          sets: exercise.sets,
        });

        if (prResult.hasNewPRs) {
          allNewPRs.push({
            exerciseName: exercise.name,
            prs: prResult.newPRs,
          });
        }

        await ctx.runMutation(api.exerciseHistory.logExercisePerformance, {
          userId: userProfile._id,
          phoneNumber: ctx.userId,
          exerciseName: exercise.name,
          normalizedName: exercise.normalizedName,
          workoutSessionId,
          date: args.date || Date.now(),
          sets: exercise.sets,
        });
      }

      return {
        success: true,
        workoutSessionId,
        totalExercises: args.exercises.length,
        totalSets: args.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0),
        newPRs: allNewPRs,
        hasNewPRs: allNewPRs.length > 0,
      };
    } catch (error) {
      console.error('❌ [logWorkoutTool] ERROR:', error);
      throw error;
    }
  },
});

export const getExerciseHistoryTool: any = createTool({
  description: `Get the performance history for a specific exercise to show progress over time.

Use this tool when:
- The user asks "how am I progressing in [exercise]?"
- The user asks "what's my history with [exercise]?"
- The user wants to see their performance trend for an exercise
- The user asks "am I getting stronger in [exercise]?"

Returns:
- Full history of the exercise with dates, weights, reps, and estimated 1RMs
- Progress summary showing improvement percentages
- All-time records for that exercise

This helps users see their strength progression and stay motivated.`,

  args: z.object({
    exerciseName: z.string().describe("Name of the exercise to look up"),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [getExerciseHistoryTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const userProfile = await ctx.runQuery(api.userProfiles.getUserProfile, {
        phoneNumber: ctx.userId,
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const { normalizeExerciseName } = await import("../helpers/exerciseNormalizer");
      const normalizedName = normalizeExerciseName(args.exerciseName);

      const history = await ctx.runQuery(api.exerciseHistory.getExerciseHistory, {
        userId: userProfile._id,
        normalizedName,
        limit: 20,
      });

      const progressSummary = await ctx.runQuery(api.exerciseHistory.getProgressSummary, {
        userId: userProfile._id,
        normalizedName,
      });

      return {
        exerciseName: args.exerciseName,
        normalizedName,
        history,
        progressSummary,
        totalSessions: history.length,
      };
    } catch (error) {
      console.error('❌ [getExerciseHistoryTool] ERROR:', error);
      throw error;
    }
  },
});

export const getWorkoutSummaryTool: any = createTool({
  description: `Get a summary of recent workouts and training adherence.

Use this tool when:
- The user asks "how have I been training?"
- The user asks about their recent workouts or training consistency
- The user wants to see their workout history
- The user asks "how many times have I trained this week/month?"

Returns:
- Number of workouts completed in the specified period
- Total exercises, sets, and volume
- Average workout duration
- Training frequency and adherence

This helps users understand their training consistency and overall volume.`,

  args: z.object({
    days: z.number().default(30).describe("Number of days to look back (default: 30)"),
  }),

  handler: async (ctx, args) => {
    console.log('🎯 [getWorkoutSummaryTool] TOOL CALLED', { userId: ctx.userId, args });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const userProfile = await ctx.runQuery(api.userProfiles.getUserProfile, {
        phoneNumber: ctx.userId,
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const stats = await ctx.runQuery(api.workoutSessions.getWorkoutStats, {
        userId: userProfile._id,
        days: args.days,
      });

      const recentWorkouts = await ctx.runQuery(api.workoutSessions.getRecentWorkouts, {
        userId: userProfile._id,
        days: args.days,
      });

      return {
        period: args.days,
        stats,
        recentWorkouts: recentWorkouts.slice(0, 5),
        totalWorkouts: stats.totalWorkouts,
      };
    } catch (error) {
      console.error('❌ [getWorkoutSummaryTool] ERROR:', error);
      throw error;
    }
  },
});

export const getUserPRsTool: any = createTool({
  description: `Get all Personal Records (PRs) for the user across all exercises.

Use this tool when:
- The user asks "what are my PRs?"
- The user asks "what are my personal records?"
- The user wants to see all their best lifts
- The user asks about their strongest lifts or best performances

Returns:
- All PRs organized by exercise
- For each exercise: 1RM, Max Reps, Max Volume, and Best Set records
- When each PR was achieved
- Improvement percentages from previous records

This gives users a complete view of their strength achievements.`,

  args: z.object({}),

  handler: async (ctx, args) => {
    console.log('🎯 [getUserPRsTool] TOOL CALLED', { userId: ctx.userId });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const userProfile = await ctx.runQuery(api.userProfiles.getUserProfile, {
        phoneNumber: ctx.userId,
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const allPRs = await ctx.runQuery(api.personalRecords.getUserPRs, {
        userId: userProfile._id,
      });

      const recentPRs = await ctx.runQuery(api.personalRecords.getRecentPRs, {
        userId: userProfile._id,
        days: 30,
      });

      return {
        allPRs,
        recentPRs,
        totalExercisesTracked: allPRs.length,
        totalPRsAchieved: recentPRs.length,
      };
    } catch (error) {
      console.error('❌ [getUserPRsTool] ERROR:', error);
      throw error;
    }
  },
});

export const generateDashboardLinkTool: any = createTool({
  description: `Generate a secure dashboard link for the user to view all their fitness data in a web interface.

Use this tool when:
- The user asks to see their progress, data, or dashboard
- The user says "Quiero ver mi data" or similar requests
- The user wants to review their body scans, training plans, workouts, or PRs in detail
- The user asks for a visual overview of their fitness journey

The tool generates a unique, secure token that allows the user to access their personalized dashboard showing:
- All body scans with progress charts
- Training and nutrition plans
- Workout history and logs
- Personal records (PRs) and exercise progression
- Predictions and forecasts
- Complete profile and statistics

Returns a clickable link that's valid for 30 days.`,

  args: z.object({}),

  handler: async (ctx, args) => {
    console.log('🎯 [generateDashboardLinkTool] TOOL CALLED', { userId: ctx.userId });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const token = await ctx.runMutation(api.dashboardTokens.generateToken, {
        phoneNumber: ctx.userId,
      });

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourtrainer.chat";
      const dashboardUrl = `${baseUrl}/dashboard?token=${token}`;

      return {
        success: true,
        dashboardUrl,
        message: `Aquí está tu dashboard personalizado:\n\n${dashboardUrl}\n\nEste link es válido por 30 días y te permite ver:\n- Todos tus body scans y progreso\n- Planes de entrenamiento y nutrición\n- Historial de workouts\n- Tus PRs y progreso por ejercicio\n- Predicciones de physique\n- Estadísticas completas`,
      };
    } catch (error) {
      console.error('❌ [generateDashboardLinkTool] ERROR:', error);
      throw error;
    }
  },
});

export const getHelpInfoTool: any = createTool({
  description: `Get help information about YourTrainer's capabilities and available commands.

Use this tool when:
- The user asks "ayuda", "help", "qué puedes hacer", "what can you do"
- The user asks about available commands or features
- The user wants to know what YourTrainer can help with
- The user asks "comandos", "funciones", "capacidades"

Returns:
- Organized list of commands and trigger phrases by category
- Link to the user's personalized dashboard
- Quick reference for how to interact with YourTrainer`,

  args: z.object({}),

  handler: async (ctx, args) => {
    console.log('🎯 [getHelpInfoTool] TOOL CALLED', { userId: ctx.userId });
    if (!ctx.userId) {
      throw new Error("User context not available");
    }
    try {
      const token = await ctx.runMutation(api.dashboardTokens.generateToken, {
        phoneNumber: ctx.userId,
      });

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourtrainer.chat";
      const dashboardUrl = `${baseUrl}/dashboard?token=${token}`;

      return {
        success: true,
        helpInfo: `**Qué puedo hacer por ti:**

📸 **Análisis de Físico**
• "Analiza esta foto"
• "Escanea mi físico"
• "Body scan"

🎥 **Análisis de Técnica**
• "Analiza este video"
• "Revisa mi técnica"
• "Check mi form"

💪 **Planes de Entrenamiento**
• "Crea un plan"
• "Diseña mi rutina"
• "Necesito un programa"

🔮 **Predicciones de Progreso**
• "¿Cómo me veré?"
• "Predice mi progreso"
• "En 8 semanas..."

🍽️ **Planes Nutricionales**
• "Plan nutricional"
• "Qué debo comer"
• "Mis macros"

📊 **Registro de Entrenamientos**
• "Registra mi entrenamiento"
• "Hice bench press 100kg x 5"
• "Anotar sesión"`,
        dashboardUrl,
      };
    } catch (error) {
      console.error('❌ [getHelpInfoTool] ERROR:', error);
      throw error;
    }
  },
});

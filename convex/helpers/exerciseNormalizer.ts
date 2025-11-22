const exerciseAliases: Record<string, string> = {
  "bench press": "bench_press",
  "press de banca": "bench_press",
  "press plano": "bench_press",
  "press banca": "bench_press",
  "pecho plano": "bench_press",

  "incline bench press": "incline_bench_press",
  "press inclinado": "incline_bench_press",
  "press de banca inclinado": "incline_bench_press",
  "pecho inclinado": "incline_bench_press",

  "decline bench press": "decline_bench_press",
  "press declinado": "decline_bench_press",
  "press de banca declinado": "decline_bench_press",

  "squat": "squat",
  "sentadilla": "squat",
  "sentadillas": "squat",
  "back squat": "squat",
  "sentadilla trasera": "squat",

  "front squat": "front_squat",
  "sentadilla frontal": "front_squat",

  "deadlift": "deadlift",
  "peso muerto": "deadlift",
  "deadlifts": "deadlift",
  "conventional deadlift": "deadlift",

  "romanian deadlift": "romanian_deadlift",
  "rdl": "romanian_deadlift",
  "peso muerto rumano": "romanian_deadlift",

  "overhead press": "overhead_press",
  "military press": "overhead_press",
  "press militar": "overhead_press",
  "press de hombro": "overhead_press",
  "press de hombros": "overhead_press",
  "shoulder press": "overhead_press",

  "pull up": "pull_up",
  "pull-up": "pull_up",
  "pullup": "pull_up",
  "dominada": "pull_up",
  "dominadas": "pull_up",

  "chin up": "chin_up",
  "chin-up": "chin_up",
  "chinup": "chin_up",
  "dominada supina": "chin_up",

  "barbell row": "barbell_row",
  "bent over row": "barbell_row",
  "remo con barra": "barbell_row",
  "remo": "barbell_row",

  "dumbbell row": "dumbbell_row",
  "one arm row": "dumbbell_row",
  "remo con mancuerna": "dumbbell_row",
  "remo mancuerna": "dumbbell_row",

  "lat pulldown": "lat_pulldown",
  "pulldown": "lat_pulldown",
  "jalon": "lat_pulldown",
  "jalón": "lat_pulldown",
  "polea al pecho": "lat_pulldown",

  "bicep curl": "bicep_curl",
  "curl de biceps": "bicep_curl",
  "curl biceps": "bicep_curl",
  "curl": "bicep_curl",
  "curl de bíceps": "bicep_curl",

  "hammer curl": "hammer_curl",
  "curl martillo": "hammer_curl",

  "tricep extension": "tricep_extension",
  "extension de triceps": "tricep_extension",
  "extensión de tríceps": "tricep_extension",

  "tricep pushdown": "tricep_pushdown",
  "pushdown": "tricep_pushdown",
  "pushdown de triceps": "tricep_pushdown",
  "empuje de tríceps": "tricep_pushdown",

  "dips": "dips",
  "fondos": "dips",
  "fondos en paralelas": "dips",

  "leg press": "leg_press",
  "prensa": "leg_press",
  "prensa de pierna": "leg_press",
  "prensa de piernas": "leg_press",

  "leg extension": "leg_extension",
  "extension de pierna": "leg_extension",
  "extensión de pierna": "leg_extension",
  "extension cuadriceps": "leg_extension",

  "leg curl": "leg_curl",
  "curl de pierna": "leg_curl",
  "curl femoral": "leg_curl",
  "flexión de pierna": "leg_curl",

  "calf raise": "calf_raise",
  "elevacion de gemelos": "calf_raise",
  "elevación de gemelos": "calf_raise",
  "elevacion de pantorrilla": "calf_raise",

  "shoulder lateral raise": "lateral_raise",
  "lateral raise": "lateral_raise",
  "elevacion lateral": "lateral_raise",
  "elevación lateral": "lateral_raise",
  "elevaciones laterales": "lateral_raise",

  "face pull": "face_pull",
  "face pulls": "face_pull",
  "jalones faciales": "face_pull",
  "tirones faciales": "face_pull",

  "cable fly": "cable_fly",
  "aperturas con cable": "cable_fly",
  "aperturas": "cable_fly",

  "dumbbell fly": "dumbbell_fly",
  "aperturas con mancuernas": "dumbbell_fly",
  "cruces con mancuernas": "dumbbell_fly",

  "hip thrust": "hip_thrust",
  "empuje de cadera": "hip_thrust",
  "elevacion de cadera": "hip_thrust",

  "lunge": "lunge",
  "zancada": "lunge",
  "zancadas": "lunge",
  "desplante": "lunge",
  "estocada": "lunge",

  "bulgarian split squat": "bulgarian_split_squat",
  "sentadilla bulgara": "bulgarian_split_squat",
  "sentadilla búlgara": "bulgarian_split_squat",

  "plank": "plank",
  "plancha": "plank",
  "tabla": "plank",

  "ab crunch": "ab_crunch",
  "crunch": "ab_crunch",
  "abdominales": "ab_crunch",

  "russian twist": "russian_twist",
  "giro ruso": "russian_twist",

  "hanging leg raise": "hanging_leg_raise",
  "elevacion de piernas colgado": "hanging_leg_raise",
  "elevación de piernas": "hanging_leg_raise",
};

export function normalizeExerciseName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ");

  const normalized = exerciseAliases[cleaned];

  if (normalized) {
    return normalized;
  }

  return cleaned
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function getCanonicalName(normalizedName: string): string {
  const canonicalNames: Record<string, string> = {
    bench_press: "Bench Press",
    incline_bench_press: "Incline Bench Press",
    decline_bench_press: "Decline Bench Press",
    squat: "Squat",
    front_squat: "Front Squat",
    deadlift: "Deadlift",
    romanian_deadlift: "Romanian Deadlift",
    overhead_press: "Overhead Press",
    pull_up: "Pull Up",
    chin_up: "Chin Up",
    barbell_row: "Barbell Row",
    dumbbell_row: "Dumbbell Row",
    lat_pulldown: "Lat Pulldown",
    bicep_curl: "Bicep Curl",
    hammer_curl: "Hammer Curl",
    tricep_extension: "Tricep Extension",
    tricep_pushdown: "Tricep Pushdown",
    dips: "Dips",
    leg_press: "Leg Press",
    leg_extension: "Leg Extension",
    leg_curl: "Leg Curl",
    calf_raise: "Calf Raise",
    lateral_raise: "Lateral Raise",
    face_pull: "Face Pull",
    cable_fly: "Cable Fly",
    dumbbell_fly: "Dumbbell Fly",
    hip_thrust: "Hip Thrust",
    lunge: "Lunge",
    bulgarian_split_squat: "Bulgarian Split Squat",
    plank: "Plank",
    ab_crunch: "Ab Crunch",
    russian_twist: "Russian Twist",
    hanging_leg_raise: "Hanging Leg Raise",
  };

  return canonicalNames[normalizedName] || normalizedName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

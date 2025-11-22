"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default function PlansPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const trainingPlans = useQuery(
    api.trainingPlans.getUserTrainingPlans,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  const nutritionPlans = useQuery(
    api.nutritionPlans.getUserNutritionPlans,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (trainingPlans === undefined || nutritionPlans === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const latestTrainingPlan = trainingPlans[0];
  const latestNutritionPlan = nutritionPlans[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Planes</h2>
        <p className="text-muted-foreground">
          Tus planes de entrenamiento y nutrición
        </p>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="training">Plan de Entrenamiento</TabsTrigger>
          <TabsTrigger value="nutrition">Plan Nutricional</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-4">
          {!latestTrainingPlan ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay plan de entrenamiento todavía
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Plan Actual</CardTitle>
                    <Badge variant="default">{latestTrainingPlan.daysPerWeek} días/semana</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creado: {format(new Date(latestTrainingPlan.timestamp), "dd MMMM yyyy", { locale: es })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Objetivo</p>
                      <Badge variant="secondary">{latestTrainingPlan.goal}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Rationale</p>
                      <p className="text-sm text-muted-foreground">{latestTrainingPlan.rationale}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Programa de {latestTrainingPlan.duration} Semanas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {latestTrainingPlan.weeks.map((week: any) => (
                      <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}`}>
                        <AccordionTrigger>
                          Semana {week.weekNumber}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {week.days.map((day: any) => (
                              <Card key={day.dayNumber}>
                                <CardHeader>
                                  <CardTitle className="text-base">
                                    Día {day.dayNumber} - {day.focus}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {day.exercises.map((exercise: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                          <p className="font-medium text-sm">{exercise.name}</p>
                                          {exercise.notes && (
                                            <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-medium">
                                            {exercise.sets} × {exercise.reps}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Descanso: {exercise.rest}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          {!latestNutritionPlan ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay plan nutricional todavía
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Plan Nutricional Actual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Creado: {format(new Date(latestNutritionPlan.timestamp), "dd MMMM yyyy", { locale: es })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Objetivo</p>
                      <Badge variant="secondary">{latestNutritionPlan.goal}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Rationale</p>
                      <p className="text-sm text-muted-foreground">{latestNutritionPlan.rationale}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Días de Entrenamiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Calorías</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosTrainingDays.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proteína</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosTrainingDays.protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbos</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosTrainingDays.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Grasas</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosTrainingDays.fats}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Días de Descanso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Calorías</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosRestDays.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proteína</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosRestDays.protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbos</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosRestDays.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Grasas</p>
                        <p className="text-2xl font-bold">{latestNutritionPlan.macrosRestDays.fats}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Ejemplos de Comidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {latestNutritionPlan.mealExamples.map((example: any, idx: number) => (
                      <AccordionItem key={idx} value={`meal-${idx}`}>
                        <AccordionTrigger>
                          Día de {example.dayType === "training" ? "Entrenamiento" : "Descanso"}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {example.meals.map((meal: any, mealIdx: number) => (
                              <div key={mealIdx} className="border-b pb-3 last:border-0">
                                <p className="font-medium mb-2">{meal.mealTime}</p>
                                <ul className="list-disc list-inside space-y-1 mb-2">
                                  {meal.foods.map((food: string, foodIdx: number) => (
                                    <li key={foodIdx} className="text-sm text-muted-foreground">{food}</li>
                                  ))}
                                </ul>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>P: {meal.macros.protein}g</span>
                                  <span>C: {meal.macros.carbs}g</span>
                                  <span>F: {meal.macros.fats}g</span>
                                  <span>Cal: {meal.macros.calories}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

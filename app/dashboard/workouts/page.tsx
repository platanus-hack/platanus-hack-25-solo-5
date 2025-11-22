"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default function WorkoutsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const workouts = useQuery(
    api.workoutSessions.getUserWorkoutSessionsByPhone,
    userData ? { phoneNumber: userData.phoneNumber, limit: 50 } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (workouts === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No hay workouts registrados</h2>
        <p className="text-muted-foreground">
          Los workouts que registres con el agente aparecerán aquí
        </p>
      </div>
    );
  }

  const totalVolume = workouts.reduce((acc, workout) => {
    const workoutVolume = workout.exercises.reduce((exAcc, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setAcc, set) => {
        return setAcc + (set.reps * set.weight);
      }, 0);
      return exAcc + exerciseVolume;
    }, 0);
    return acc + workoutVolume;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workouts</h2>
        <p className="text-muted-foreground">
          Historial de entrenamientos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workouts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVolume.toFixed(0)} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Último Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {workouts[0] && format(new Date(workouts[0].date), "dd MMM", { locale: es })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {workouts.map((workout) => (
              <AccordionItem key={workout._id} value={workout._id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">
                      {format(new Date(workout.date), "dd MMMM yyyy", { locale: es })}
                    </span>
                    <Badge variant="secondary">{workout.exercises.length} ejercicios</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{exercise.name}</h4>
                        <div className="space-y-2">
                          {exercise.sets.map((set, setIdx) => (
                            <div key={setIdx} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Set {set.setNumber}</span>
                              <div className="flex gap-4">
                                <span>{set.reps} reps</span>
                                <span className="font-medium">{set.weight} kg</span>
                                {set.rpe && <Badge variant="outline">RPE {set.rpe}</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {workout.notes && (
                      <div className="text-sm text-muted-foreground border-t pt-2">
                        <strong>Notas:</strong> {workout.notes}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ProgressPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const prs = useQuery(
    api.personalRecords.getUserPRsByPhone,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (prs === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No hay PRs registrados</h2>
        <p className="text-muted-foreground">
          Los PRs que logres aparecerán aquí
        </p>
      </div>
    );
  }

  // Flatten PRs from grouped structure
  const allPRs = prs.flatMap((exercise) =>
    Object.values(exercise.records)
  );

  const prsByExercise = prs.reduce((acc: any, exercise) => {
    acc[exercise.normalizedName] = Object.values(exercise.records);
    return acc;
  }, {});

  const exerciseNames = prs.map(ex => ex.normalizedName);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress & PRs</h2>
        <p className="text-muted-foreground">
          Tu progreso y records personales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Todos tus PRs ({allPRs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {allPRs.map((pr) => (
              <Card key={pr._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{pr.exerciseName}</p>
                    <Badge variant="secondary">{pr.recordType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Valor</span>
                      <span className="text-xl font-bold">{pr.value}</span>
                    </div>
                    {pr.improvementPercentage && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Mejora</span>
                        <Badge variant="default">+{pr.improvementPercentage.toFixed(1)}%</Badge>
                      </div>
                    )}
                    {pr.achievedAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pr.achievedAt), "dd MMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {exerciseNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Ejercicio</CardTitle>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {prs.map((exercise) => (
                  <SelectItem key={exercise.normalizedName} value={exercise.normalizedName}>
                    {exercise.exerciseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          {selectedExercise && (
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={prsByExercise[selectedExercise]
                    .map((pr: any) => ({
                      date: format(new Date(pr.achievedAt), "dd MMM", { locale: es }),
                      value: pr.value,
                    }))
                    .reverse()}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

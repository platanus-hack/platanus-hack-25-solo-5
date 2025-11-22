"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Flame, Scan, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BodyfatChart({ scans }: { scans: any[] }) {
  const data = scans
    .map((scan) => ({
      date: format(new Date(scan.timestamp), "dd MMM", { locale: es }),
      bodyfat: (scan.analysis.bodyfatPercentage.min + scan.analysis.bodyfatPercentage.max) / 2,
    }))
    .reverse();

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay datos de body scans todavía
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="bodyfat" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const dashboardData = useQuery(
    api.dashboard.getDashboardOverview,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (dashboardData === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { userProfile, stats, latestBodyScan, recentWorkouts, recentPRs, bodyScansHistory } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Hola, {userProfile.phoneNumber}
        </h2>
        <p className="text-muted-foreground">
          Aquí está tu resumen de progreso
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          icon={Activity}
          description="Entrenamientos completados"
        />
        <StatsCard
          title="Personal Records"
          value={stats.totalPRs}
          icon={TrendingUp}
          description="PRs alcanzados"
        />
        <StatsCard
          title="Body Scans"
          value={stats.totalScans}
          icon={Scan}
          description="Análisis de physique"
        />
        <StatsCard
          title="Training Plans"
          value={stats.totalPlans}
          icon={Flame}
          description="Planes generados"
        />
      </div>

      {latestBodyScan && (
        <Card>
          <CardHeader>
            <CardTitle>Último Body Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Bodyfat %</p>
                <p className="text-2xl font-bold">
                  {latestBodyScan.analysis.bodyfatPercentage.min}% - {latestBodyScan.analysis.bodyfatPercentage.max}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Physique Type</p>
                <Badge variant="secondary" className="mt-1">
                  {latestBodyScan.analysis.physiqueType}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Fortalezas</p>
              <ul className="list-disc list-inside space-y-1">
                {latestBodyScan.analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">{strength}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {bodyScansHistory && bodyScansHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Bodyfat %</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyfatChart scans={bodyScansHistory} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay workouts registrados todavía
              </p>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout: any) => (
                  <div key={workout._id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {format(new Date(workout.date), "dd MMMM yyyy", { locale: es })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workout.exercises.length} ejercicios
                      </p>
                    </div>
                    <Badge variant="outline">{workout.duration || "N/A"} min</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PRs Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPRs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay PRs registrados todavía
              </p>
            ) : (
              <div className="space-y-3">
                {recentPRs.map((pr: any) => (
                  <div key={pr._id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium text-sm">{pr.exerciseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pr.achievedAt), "dd MMMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{pr.value}</p>
                      {pr.improvementPercentage && (
                        <Badge variant="default" className="text-xs">
                          +{pr.improvementPercentage.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

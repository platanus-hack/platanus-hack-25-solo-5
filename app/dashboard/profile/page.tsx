"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Target, Dumbbell, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (!userData.userProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const profile = userData.userProfile;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
        <p className="text-muted-foreground">
          Tu información y preferencias
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <span className="font-medium">{profile.phoneNumber}</span>
            </div>
            {profile.age && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Edad</span>
                <span className="font-medium">{profile.age} años</span>
              </div>
            )}
            {profile.sex && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sexo</span>
                <Badge variant="secondary">{profile.sex}</Badge>
              </div>
            )}
            {profile.weight && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peso</span>
                <span className="font-medium">{profile.weight} kg</span>
              </div>
            )}
            {profile.height && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Altura</span>
                <span className="font-medium">{profile.height} cm</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos y Experiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.goal && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Objetivo</span>
                <Badge variant="default">{profile.goal}</Badge>
              </div>
            )}
            {profile.experience && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Experiencia</span>
                <Badge variant="secondary">{profile.experience}</Badge>
              </div>
            )}
            {profile.trainingDaysPerWeek && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Días/semana</span>
                <span className="font-medium">{profile.trainingDaysPerWeek} días</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {profile.equipment && profile.equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Equipamiento Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.equipment.map((item, i) => (
                <Badge key={i} variant="outline">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Estado de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Onboarding Completado</span>
            <Badge variant={profile.onboardingCompleted ? "default" : "secondary"}>
              {profile.onboardingCompleted ? "Sí" : "No"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

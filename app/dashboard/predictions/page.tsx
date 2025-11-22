"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default function PredictionsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const predictions = useQuery(
    api.predictions.getUserPredictions,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (predictions === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No hay predicciones todavía</h2>
        <p className="text-muted-foreground">
          Las predicciones de progreso aparecerán aquí
        </p>
      </div>
    );
  }

  const latestPrediction = predictions[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Predicciones</h2>
        <p className="text-muted-foreground">
          Pronósticos de tu progreso physique
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Última Predicción</CardTitle>
            <Badge variant="default">{latestPrediction.timeframe} semanas</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(latestPrediction.timestamp), "dd MMMM yyyy", { locale: es })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-2">Cambio en Bodyfat %</p>
              <p className="text-2xl font-bold">
                {latestPrediction.predictions.bodyfatChange.min}% - {latestPrediction.predictions.bodyfatChange.max}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Basado en</p>
              <div className="flex gap-2">
                <Badge variant="secondary">{latestPrediction.basedOnScans.length} scans</Badge>
                <Badge variant="secondary">{latestPrediction.basedOnBiomech.length} análisis</Badge>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Cambios Musculares Predichos</p>
            <p className="text-sm text-muted-foreground">
              {latestPrediction.predictions.muscularChanges}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Progreso de Fuerza</p>
            <p className="text-sm text-muted-foreground">
              {latestPrediction.predictions.strengthProgress}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Mejora de Postura</p>
            <p className="text-sm text-muted-foreground">
              {latestPrediction.predictions.postureProgress}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Balance Estético</p>
            <p className="text-sm text-muted-foreground">
              {latestPrediction.predictions.aestheticBalance}
            </p>
          </div>

          {latestPrediction.assumptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Supuestos</p>
              <ul className="list-disc list-inside space-y-1">
                {latestPrediction.assumptions.map((assumption: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Esta es una estimación basada en tu historial y progreso actual, no una garantía.
            </p>
          </div>
        </CardContent>
      </Card>

      {predictions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Predicciones Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.slice(1).map((prediction) => (
                <div key={prediction._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {format(new Date(prediction.timestamp), "dd MMMM yyyy", { locale: es })}
                    </p>
                    <Badge variant="secondary">{prediction.timeframe} semanas</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bodyfat: {prediction.predictions.bodyfatChange.min}% - {prediction.predictions.bodyfatChange.max}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

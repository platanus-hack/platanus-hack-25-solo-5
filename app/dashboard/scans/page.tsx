"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function ScansPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const userData = useQuery(
    api.dashboardTokens.getUserByToken,
    token ? { token } : "skip"
  );

  const scans = useQuery(
    api.bodyScans.getUserBodyScans,
    userData ? { phoneNumber: userData.phoneNumber } : "skip"
  );

  if (!token || !userData) {
    return null;
  }

  if (scans === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No hay body scans todavía</h2>
        <p className="text-muted-foreground">
          Envía una foto de tu physique al agente para comenzar
        </p>
      </div>
    );
  }

  const chartData = scans
    .map((scan) => ({
      date: format(new Date(scan.timestamp), "dd MMM", { locale: es }),
      bodyfat: (scan.analysis.bodyfatPercentage.min + scan.analysis.bodyfatPercentage.max) / 2,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Body Scans</h2>
        <p className="text-muted-foreground">
          Historial completo de análisis de physique
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso de Bodyfat %</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip />
              <Line type="monotone" dataKey="bodyfat" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galería de Scans ({scans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full">
            <CarouselContent>
              {scans.map((scan) => (
                <CarouselItem key={scan._id} className="md:basis-1/2 lg:basis-1/3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={scan.imageUrl}
                          alt="Body scan"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {format(new Date(scan.timestamp), "dd MMMM yyyy", { locale: es })}
                          </p>
                          <Badge variant="secondary">
                            {scan.analysis.bodyfatPercentage.min}% - {scan.analysis.bodyfatPercentage.max}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {scan.analysis.physiqueType}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scans.map((scan) => (
          <Card key={scan._id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(new Date(scan.timestamp), "dd MMMM yyyy", { locale: es })}
              </CardTitle>
              <Badge variant="secondary" className="w-fit">
                {scan.analysis.bodyfatPercentage.min}% - {scan.analysis.bodyfatPercentage.max}%
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Physique Type</p>
                <p className="text-sm text-muted-foreground">{scan.analysis.physiqueType}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Fortalezas</p>
                <ul className="list-disc list-inside space-y-1">
                  {scan.analysis.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Oportunidades</p>
                <ul className="list-disc list-inside space-y-1">
                  {scan.analysis.opportunities.map((opp: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{opp}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

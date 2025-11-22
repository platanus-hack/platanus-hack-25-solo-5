"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Phone, MessageSquare, Bot, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-3/4" />
      <Skeleton className="h-20 w-3/4 ml-auto" />
      <Skeleton className="h-20 w-3/4" />
    </div>
  );
}

export default function ThreadMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const threadData = useQuery(
    api.admin.getThreadMessages,
    threadId ? { threadId } : "skip"
  );

  const deleteUserMutation = useMutation(api.admin.deleteUserCompletely);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserMutation({ threadId });
      toast.success(`Usuario ${result.phoneNumber} eliminado completamente`);
      router.push("/admin/chats");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar usuario");
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (threadData?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadData?.messages]);

  if (!threadId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Thread ID no válido</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/chats")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Conversación</h2>
            {threadData && (
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">{threadData.phoneNumber}</p>
                <Badge variant="outline" className="ml-2">
                  {threadData.messages.length} mensajes
                </Badge>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes</CardTitle>
        </CardHeader>
        <CardContent>
          {!threadData ? (
            <MessageSkeleton />
          ) : threadData.messages.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
              {threadData.messages.map((message, index) => {
                const isUser = message.role === "user";
                const isAssistant = message.role === "assistant";

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {isAssistant && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[70%]",
                        isUser && "items-end"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isUser ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {isUser ? "Usuario" : isAssistant ? "Asistente" : "Sistema"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.timestamp), "HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg p-3 whitespace-pre-wrap break-words",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {isUser && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay mensajes en este chat</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario completamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente y no se puede deshacer. Se eliminará:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos los mensajes del chat</li>
                <li>Perfil del usuario</li>
                <li>Todos los body scans e imágenes</li>
                <li>Análisis biomecánicos y videos</li>
                <li>Planes de entrenamiento y nutrición</li>
                <li>Historial de entrenamientos y PRs</li>
              </ul>
              <p className="mt-3 font-semibold text-destructive">
                {threadData?.phoneNumber && `Usuario: ${threadData.phoneNumber}`}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

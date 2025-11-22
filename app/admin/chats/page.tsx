"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Phone, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

function ChatSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export default function AdminChatsPage() {
  const threads = useQuery(api.admin.getAllThreads);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = threads?.filter((thread) =>
    thread.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chats</h2>
        <p className="text-muted-foreground">
          Todos los chats de WhatsApp en tiempo real
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por número de teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        {threads && (
          <Badge variant="outline" className="text-sm">
            {filteredThreads?.length || 0} chats
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {!threads ? (
          <>
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
          </>
        ) : filteredThreads && filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <Link key={thread.threadId} href={`/admin/chats/${thread.threadId}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{thread.from}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {thread.messageCount} mensajes
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {thread.lastMessage
                      ? formatDistanceToNow(new Date(thread.lastMessage.timestamp), {
                          addSuffix: true,
                          locale: es,
                        })
                      : formatDistanceToNow(new Date(thread.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {thread.lastMessage ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            thread.lastMessage.role === "user"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {thread.lastMessage.role === "user"
                            ? "Usuario"
                            : "Asistente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {thread.lastMessage.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sin mensajes aún
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No se encontraron chats" : "No hay chats aún"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar";
import { MainChat } from "@/components/main-chat";
import { ChatConversation } from "@/components/chat-conversation";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useSyncUser } from "@/hooks/use-sync-user";
import { usePostSignupAttribution } from "@/hooks/use-post-signup-attribution";

export function ChatInterface({ initialThreadId }: { initialThreadId?: string }) {
  useSyncUser();
  usePostSignupAttribution();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Sidebar starts closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4.1-mini");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<"limit_reached" | "manual">("manual");
  const [shouldCreateThread, setShouldCreateThread] = useState(false);
  const [isImageGenerationMode, setIsImageGenerationMode] = useState(false);
  const [isWebSearchMode, setIsWebSearchMode] = useState(false);

  // Convert initialThreadId string to Convex ID
  const activeThreadId = initialThreadId ? (initialThreadId as Id<"threads">) : null;

  // Check if there's a selected model from URL params or localStorage
  useEffect(() => {
    const modelFromUrl = searchParams.get("model");
    const storedModel = localStorage.getItem("selectedModel");

    if (modelFromUrl) {
      setSelectedModel(modelFromUrl);
    } else if (storedModel) {
      setSelectedModel(storedModel);
      localStorage.removeItem("selectedModel"); // Clear after reading
      setShouldCreateThread(true); // Flag to create thread after component mounts
    }
  }, [searchParams]);

  // Get all threads - only if authenticated
  const threads = useQuery(api.chat.getThreads, isAuthenticated ? {} : "skip");

  // Validate thread exists and belongs to user
  const threadData = useQuery(
    api.chat.getThread,
    isAuthenticated && activeThreadId ? { threadId: activeThreadId } : "skip"
  );

  // Get messages for active thread - only if authenticated
  const messages = useQuery(
    api.chat.getMessages,
    isAuthenticated && activeThreadId ? { threadId: activeThreadId } : "skip"
  );

  // Create new thread mutation
  const createThread = useMutation(api.chat.createNewThread);

  // Redirect to /chat if thread doesn't exist or user doesn't have access
  useEffect(() => {
    if (activeThreadId && isAuthenticated && threadData === null) {
      // Thread doesn't exist or user doesn't have access
      router.push("/chat");
    }
  }, [activeThreadId, isAuthenticated, threadData, router]);

  // Handle creating a new chat
  const handleNewChat = () => {
    // Navigate to base chat page (empty state)
    router.push("/chat");
  };

  // Handle selecting a thread
  const handleThreadSelect = (threadId: Id<"threads">) => {
    // Navigate to thread page
    router.push(`/chat/${threadId}`);
  };

  // Handle upgrade modal
  const handleUpgradeClick = (reason: "limit_reached" | "manual" = "manual") => {
    setUpgradeModalTrigger(reason);
    setUpgradeModalOpen(true);
  };

  // Handle model change
  const handleModelChange = (newModelId: string) => {
    // Update the selected model
    setSelectedModel(newModelId);

    // Update URL with model parameter, preserving thread ID if present
    const params = new URLSearchParams(searchParams.toString());
    params.set("model", newModelId);
    if (activeThreadId) {
      router.push(`/chat/${activeThreadId}?${params.toString()}`);
    } else {
      router.push(`/chat?${params.toString()}`);
    }
  };

  // Handle image generation mode toggle
  const handleToggleImageMode = () => {
    setIsImageGenerationMode(!isImageGenerationMode);
  };

  // Handle web search mode toggle
  const handleToggleWebSearchMode = () => {
    setIsWebSearchMode(!isWebSearchMode);
  };

  // Auto-create thread when coming from explore-bots
  useEffect(() => {
    if (shouldCreateThread && createThread) {
      setShouldCreateThread(false);
      handleNewChat();
    }
  }, [shouldCreateThread, createThread]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLoginClick={() => router.push("/login")}
        onUpgradeClick={() => handleUpgradeClick("manual")}
        onChatSelect={handleThreadSelect}
        onNewChat={handleNewChat}
        activeThreadId={activeThreadId}
        threads={threads}
      />
      {activeThreadId ? (
        <ChatConversation
          threadId={activeThreadId}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          messages={messages}
          onUpgradeClick={handleUpgradeClick}
          onLoginClick={() => router.push("/login")}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          isImageGenerationMode={isImageGenerationMode}
          onToggleImageMode={handleToggleImageMode}
          isWebSearchMode={isWebSearchMode}
          onToggleWebSearchMode={handleToggleWebSearchMode}
        />
      ) : (
        <MainChat
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          onThreadCreated={handleThreadSelect}
          onUpgradeClick={handleUpgradeClick}
          onLoginClick={() => router.push("/login")}
          isImageGenerationMode={isImageGenerationMode}
          onToggleImageMode={handleToggleImageMode}
          isWebSearchMode={isWebSearchMode}
          onToggleWebSearchMode={handleToggleWebSearchMode}
        />
      )}
      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} triggerReason={upgradeModalTrigger} />
    </div>
  );
}

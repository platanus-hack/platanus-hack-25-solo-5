"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useAction, useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModelCards } from "@/components/model-cards";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Paperclip,
  ImageIcon,
  Globe,
  AudioWaveform,
  ChevronDown,
  Menu,
  Pen,
  BookOpen,
  ScanSearch,
  FileText,
  Plus,
  Send,
  MessageSquare,
  Settings,
  Square,
} from "lucide-react";
import { SiOpenai, SiGooglegemini } from "react-icons/si";
import { FaSearch } from "react-icons/fa";
import { AVAILABLE_MODELS, getProviderIcon } from "@/lib/models";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileAttachmentInput, FileAttachment, FileAttachmentHandle } from "@/components/file-attachment";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useToast } from "@/hooks/use-toast";

interface MainChatProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onThreadCreated: (threadId: Id<"threads">) => void;
  onUpgradeClick: (reason?: "limit_reached" | "manual") => void;
  onLoginClick: () => void;
  isImageGenerationMode: boolean;
  onToggleImageMode: () => void;
  isWebSearchMode: boolean;
  onToggleWebSearchMode: () => void;
}

export function MainChat({ sidebarOpen, onSidebarToggle, selectedModel, onModelChange, onThreadCreated, onUpgradeClick, onLoginClick, isImageGenerationMode, onToggleImageMode, isWebSearchMode, onToggleWebSearchMode }: MainChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileAttachmentRef = useRef<FileAttachmentHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const createThread = useMutation(api.chat.createNewThread);
  const sendMessage = useAction(api.chat.sendMessage);
  const { toast } = useToast();

  const {
    state: recordingState,
    duration: recordingDuration,
    transcript,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const currentUser = useQuery(api.authUtils.getCurrentUser);
  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const messageCount = useQuery(
    api.subscriptions.getMessageCount,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const isPro =
    subscription &&
    (["active", "trialing"].includes(subscription.status) ||
      (subscription.status === "past_due" && Date.now() < subscription.currentPeriodEnd));

  // Convert AVAILABLE_MODELS to array format with UI properties
  const models = Object.values(AVAILABLE_MODELS).map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    isPro: model.isPro,
    iconBg: model.provider === "google" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-200 dark:bg-gray-700",
    iconColor: model.provider === "google" ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300",
  }));

  useEffect(() => {
    if (recordingError) {
      toast({
        variant: "destructive",
        title: "Error de grabación",
        description: recordingError,
      });
    }
  }, [recordingError, toast]);

  useEffect(() => {
    if (transcript && recordingState === "idle") {
      setMessage((prev) => {
        const trimmedPrev = prev.trim();
        const trimmedTranscript = transcript.trim();
        if (!trimmedPrev) return trimmedTranscript;
        return trimmedPrev + " " + trimmedTranscript;
      });

      toast({
        title: "Transcripción completada",
        description: "El audio se ha transcrito correctamente.",
      });

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [transcript, recordingState, toast]);

  const handleDictateClick = async () => {
    if (recordingState === "idle") {
      await startRecording();
    } else if (recordingState === "recording") {
      stopRecording();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!message.trim() && files.length === 0) || isLoading) return;

    // Check if user is authenticated with Clerk
    if (!isSignedIn) {
      onLoginClick();
      return;
    }

    const modelInfo = AVAILABLE_MODELS[selectedModel];
    if (modelInfo?.isPro) {
      onUpgradeClick();
      return;
    }

    if (!isPro && messageCount) {
      if (messageCount.count >= 3) {
        onUpgradeClick("limit_reached");
        return;
      }
    }

    // Check if all files are uploaded
    const hasUploadingFiles = files.some((f) => f.uploading);
    if (hasUploadingFiles) {
      return;
    }

    setIsLoading(true);

    try {
      // Create new thread
      const threadId = await createThread({ modelId: selectedModel });

      // Switch to the new thread IMMEDIATELY (before sending message)
      onThreadCreated(threadId);

      // Prepare attachments data
      const attachments = files
        .filter((f) => f.storageId)
        .map((f) => ({
          storageId: f.storageId!,
          filename: f.file.name,
          mimeType: f.file.type,
          size: f.file.size,
          extractedText: f.extractedText,
        }));

      // Clear message input and files
      let messageToSend = message.trim() || "Analyze these files";

      if (isImageGenerationMode) {
        messageToSend = `Generate an image: ${messageToSend}`;
        onToggleImageMode();
      }

      if (isWebSearchMode) {
        messageToSend = `Search the web: ${messageToSend}`;
        onToggleWebSearchMode();
      }

      setMessage("");
      setFiles([]);

      // Send message in background (user will see loading state in ChatConversation)
      sendMessage({
        threadId,
        message: messageToSend,
        modelId: selectedModel,
        attachments: attachments.length > 0 ? attachments : undefined,
      }).catch((error) => {
        console.error("Error sending message:", error);
        if (error instanceof ConvexError && error.data === "FREE_LIMIT_REACHED") {
          onUpgradeClick("limit_reached");
        }
      });
    } catch (error) {
      console.error("Error creating thread:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left: Menu button (mobile) */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden cursor-pointer" onClick={onSidebarToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center: Model selector */}
        <div className="flex-1 flex justify-center">
          {/* Mobile: Button to open sheet */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-sm font-medium hover:bg-accent md:hidden cursor-pointer"
            onClick={() => setModelSheetOpen(true)}
          >
            <Settings className="h-4 w-4" />
            {models.find((m) => m.id === selectedModel)?.name || selectedModel}
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Desktop: Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hover:bg-accent cursor-pointer">
                <Settings className="h-4 w-4" />
                {models.find((m) => m.id === selectedModel)?.name || selectedModel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-muted-foreground font-normal text-sm">
                Select Model
              </DropdownMenuLabel>
              <div className="space-y-1">
                {models.map((model) => {
                  let Icon: any = SiOpenai;
                  if (model.id === "google/gemini-2.0-flash") Icon = SiGooglegemini;
                  if (model.id === "deepseek/deepseek-chat") Icon = FaSearch;

                  return (
                    <DropdownMenuItem
                      key={model.id}
                      className="flex items-start gap-3 p-3 cursor-pointer rounded-lg"
                      onSelect={() => onModelChange(model.id)}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${model.iconBg}`}>
                        <Icon className={`h-6 w-6 ${model.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-base">{model.name}</p>
                          {model.isPro && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Message counter + Theme toggle */}
        <div className="flex items-center gap-2">
          {!isPro && messageCount && isSignedIn && (
            <Badge variant="secondary" className="text-xs">
              {3 - messageCount.count} left
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex items-center">
        <div className="max-w-3xl w-full mx-auto px-4 py-8 md:py-16">
          {/* AI Icon and Greeting */}
          <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
            <div className="mb-6">
              <svg
                className="w-16 h-16 md:w-20 md:h-20"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 10L60 30L80 25L70 45L90 50L70 55L80 75L60 70L50 90L40 70L20 75L30 55L10 50L30 45L20 25L40 30L50 10Z"
                  fill="currentColor"
                  className="text-foreground"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Good afternoon{user?.firstName ? `, ${user.firstName}` : ""}
            </h2>
            <p className="text-lg text-muted-foreground">How can I help you today?</p>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="mb-6">
            <div className="relative bg-card border border-border dark:bg-input bg-transparent">
              <div className="px-4 pt-4">
                <FileAttachmentInput
                  ref={fileAttachmentRef}
                  files={files}
                  onFilesChange={setFiles}
                />
              </div>

              {isImageGenerationMode && (
                <div className="px-4 pb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Image Generation Mode
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onToggleImageMode}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {isWebSearchMode && (
                <div className="px-4 pb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Web Search Mode
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onToggleWebSearchMode}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isImageGenerationMode ? "Describe your image..." :
                  isWebSearchMode ? "What do you want to search?" :
                  "Type a message..."
                }
                disabled={isLoading}
                rows={1}
                className="w-full pl-4 pr-16 pt-4 pb-16 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[72px] max-h-[200px] shadow-none placeholder:text-[#7c7c7c]"
              />

              {/* Input Actions - Single row at bottom */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileAttachmentRef.current?.openFilePicker()}
                    className="h-9 w-9 border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  {/* Desktop: With text labels */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggleImageMode}
                    className="hidden md:flex h-9 gap-2 border-muted-foreground/20 bg-transparent text-[#7c7c7c] hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer px-4"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">Create an image</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggleWebSearchMode}
                    className="hidden md:flex h-9 gap-2 border-muted-foreground/20 bg-transparent text-[#7c7c7c] hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer px-4"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Search the web</span>
                  </Button>
                  {/* Mobile: Only icons */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onToggleImageMode}
                    className="md:hidden h-9 w-9 border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onToggleWebSearchMode}
                    className="md:hidden h-9 w-9 border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>

                <div className="pointer-events-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        disabled={isLoading || recordingState === "processing"}
                        onClick={handleDictateClick}
                        size="icon"
                        className={`h-10 w-10 rounded-full ${
                          recordingState === "recording"
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-foreground hover:bg-foreground/90"
                        } text-background disabled:opacity-50 cursor-pointer`}
                      >
                        {recordingState === "processing" ? (
                          <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : recordingState === "recording" ? (
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <Square className="h-3 w-3 fill-current" />
                            <span className="text-[8px] font-medium">{recordingDuration}s</span>
                          </div>
                        ) : (
                          <AudioWaveform className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {recordingState === "recording"
                          ? "Detener grabación"
                          : recordingState === "processing"
                          ? "Procesando..."
                          : "Dictado por voz"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          {/* Desktop: Normal flex wrap */}
          <div className="hidden md:flex flex-wrap gap-2 mb-12 justify-center">
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto">
              <Pen className="h-4 w-4" />
              Help me write
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto">
              <BookOpen className="h-4 w-4" />
              Learn about
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto">
              <ScanSearch className="h-4 w-4" />
              Analyze image
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto">
              <FileText className="h-4 w-4" />
              Summarize text
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto">
              <Plus className="h-4 w-4" />
              See More
            </Button>
          </div>

          {/* Mobile: Scrollable carousel (manual scroll) */}
          <div className="md:hidden mb-12 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4">
              <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto flex-shrink-0">
                <Pen className="h-4 w-4" />
                Help me write
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto flex-shrink-0">
                <BookOpen className="h-4 w-4" />
                Learn about
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto flex-shrink-0">
                <ScanSearch className="h-4 w-4" />
                Analyze image
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto flex-shrink-0">
                <FileText className="h-4 w-4" />
                Summarize text
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-foreground/70 cursor-pointer rounded-full px-4 py-2 h-auto flex-shrink-0">
                <Plus className="h-4 w-4" />
                See More
              </Button>
            </div>
          </div>

          {/* Available Models Section - Hidden on mobile */}
          <div className="hidden md:block">
            <ModelCards onModelSelect={onModelChange} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-center text-muted-foreground">
          By using Chattia, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and acknowledge our{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Model Selector Sheet */}
      <Sheet open={modelSheetOpen} onOpenChange={setModelSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Select Model</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(90vh-65px)] p-4">
            <div className="space-y-2">
              {models.map((model) => {
                const modelInfo = AVAILABLE_MODELS[model.id];
                const providerIcon = modelInfo ? getProviderIcon(modelInfo.provider) : getProviderIcon("openai");
                const Icon = providerIcon.icon;

                return (
                  <button
                    key={model.id}
                    className="w-full flex items-start gap-3 p-4 rounded-lg hover:bg-accent transition-colors text-left cursor-pointer"
                    onClick={() => {
                      onModelChange(model.id);
                      setModelSheetOpen(false);
                    }}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${providerIcon.bgColor}`}>
                      <Icon className={`h-6 w-6 ${providerIcon.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-base">{model.name}</p>
                        {model.isPro && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                            Pro
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}

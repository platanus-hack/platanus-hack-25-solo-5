"use client";

import { useState, useRef, useEffect } from "react";
import { useAction, useMutation, useConvexAuth, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Paperclip, ImageIcon, Globe, Send, ChevronDown, ChevronUp, Copy, Settings, RotateCcw, ThumbsUp, ThumbsDown, AudioWaveform, Menu, X, MessageSquare, SquarePen, Square } from "lucide-react";
import { AVAILABLE_MODELS, getProviderIcon } from "@/lib/models";
import { MarkdownMessage } from "@/components/markdown-message";
import { ChatSkeleton } from "@/components/chat-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileAttachmentInput, FileAttachment, FileAttachmentHandle } from "@/components/file-attachment";
import { FilePreview } from "@/components/file-preview";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useToast } from "@/hooks/use-toast";

interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  threadId: Id<"threads">;
  role: "user" | "assistant" | "system";
  content: string;
  modelId?: string;
  attachments?: {
    storageId: string;
    filename: string;
    mimeType: string;
    size: number;
    url?: string;
  }[];
  toolCalls?: {
    toolName: string;
    args: any;
    result: any;
  }[];
  metadata?: {
    tokens?: number;
    finishReason?: string;
    duration?: number;
  };
  feedback?: "like" | "dislike";
  createdAt: number;
}

interface ChatConversationProps {
  threadId: Id<"threads">;
  selectedModel: string;
  onModelChange: (model: string) => void;
  messages: Message[] | undefined;
  onUpgradeClick: (reason?: "limit_reached" | "manual") => void;
  onLoginClick: () => void;
  onSidebarToggle?: () => void;
  onNewChat: () => void;
  isImageGenerationMode: boolean;
  onToggleImageMode: () => void;
  isWebSearchMode: boolean;
  onToggleWebSearchMode: () => void;
}

export function ChatConversation({ threadId, selectedModel, onModelChange, messages, onUpgradeClick, onLoginClick, onSidebarToggle, onNewChat, isImageGenerationMode, onToggleImageMode, isWebSearchMode, onToggleWebSearchMode }: ChatConversationProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileAttachmentRef = useRef<FileAttachmentHandle>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const sendMessage = useAction(api.chat.sendMessage);
  const updateFeedback = useMutation(api.chat.updateMessageFeedback);
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

  // Convert AVAILABLE_MODELS to array format
  const models = Object.values(AVAILABLE_MODELS);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set loading state based on message pattern
  useEffect(() => {
    if (!messages) {
      setIsLoading(false);
      return;
    }

    // If no messages, we're waiting for first message
    if (messages.length === 0) {
      setIsLoading(true);
      return;
    }

    // If last message is from user, we're waiting for assistant response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [messages, threadId]);

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

    let currentMessage = message.trim() || "Analyze these files";

    if (isImageGenerationMode) {
      currentMessage = `Generate an image: ${currentMessage}`;
      onToggleImageMode();
    }

    if (isWebSearchMode) {
      currentMessage = `Search the web: ${currentMessage}`;
      onToggleWebSearchMode();
    }

    setMessage("");
    setFiles([]);
    setIsLoading(true);

    try {
      await sendMessage({
        threadId,
        message: currentMessage,
        modelId: selectedModel,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessage(currentMessage);
      setIsLoading(false);

      if (error instanceof ConvexError && error.data === "FREE_LIMIT_REACHED") {
        onUpgradeClick("limit_reached");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = async (messageId: Id<"messages">, feedbackType: "like" | "dislike", currentFeedback?: "like" | "dislike") => {
    // Toggle feedback: if clicking the same one, remove it; otherwise set new feedback
    const newFeedback = currentFeedback === feedbackType ? undefined : feedbackType;
    await updateFeedback({ messageId, feedback: newFeedback });
  };

  const handleRegenerateMessage = async (messageIndex: number) => {
    // Check if user is authenticated with Clerk
    if (!isSignedIn) {
      onLoginClick();
      return;
    }

    // Check if the selected model is Pro
    const modelInfo = AVAILABLE_MODELS[selectedModel];
    if (modelInfo?.isPro) {
      // Show upgrade modal and stop execution
      onUpgradeClick();
      return;
    }

    // Find the user message that prompted this assistant response
    const userMessage = messages[messageIndex - 1];
    if (userMessage && userMessage.role === "user") {
      setIsLoading(true);
      try {
        await sendMessage({
          threadId,
          message: userMessage.content,
          modelId: selectedModel,
        });
      } catch (error) {
        console.error("Error regenerating message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left: Menu button (mobile) */}
        <div className="flex items-center">
          {onSidebarToggle && (
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden cursor-pointer" onClick={onSidebarToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center: Model selector - Mobile only */}
        <div className="flex-1 flex justify-center md:hidden">
          {/* Mobile: Button to open sheet */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-sm font-medium hover:bg-accent cursor-pointer"
            onClick={() => setModelSheetOpen(true)}
          >
            <Settings className="h-4 w-4" />
            {models.find((m) => m.id === selectedModel)?.name || selectedModel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop: Empty center to maintain layout */}
        <div className="hidden md:flex flex-1"></div>

        {/* Right: Message counter + Theme toggle and New Chat button */}
        <div className="flex items-center gap-2">
          {!isPro && messageCount && isSignedIn && (
            <Badge variant="secondary" className="text-xs">
              {3 - messageCount.count} left
            </Badge>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={onNewChat}>
            <SquarePen className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!messages || (messages.length === 0 && isLoading) ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No messages yet</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, index) => {
            // Get the provider icon for assistant messages
            const modelInfo = msg.modelId ? AVAILABLE_MODELS[msg.modelId] : null;
            const providerIcon = modelInfo ? getProviderIcon(modelInfo.provider) : null;
            const ProviderIcon = providerIcon?.icon;

            return (
            <div key={msg._id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${providerIcon?.bgColor || 'bg-muted'} flex items-center justify-center cursor-pointer`}>
                      {ProviderIcon ? (
                        <ProviderIcon className={`h-4 w-4 ${providerIcon?.color || 'text-foreground'}`} />
                      ) : (
                        <Settings className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {msg.metadata && (
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1">
                        {msg.modelId && <p className="font-medium">{msg.modelId}</p>}
                        {msg.metadata.tokens && <p>{msg.metadata.tokens} tokens</p>}
                        {msg.metadata.duration && <p>{(msg.metadata.duration / 1000).toFixed(1)}s</p>}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
              <div className={`flex flex-col gap-2 max-w-[85%] min-w-0 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2 overflow-hidden ${
                    msg.role === "user" ? "bg-foreground text-background" : "bg-muted text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>

                {/* File attachments display */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="w-full">
                    <FilePreview attachments={msg.attachments} />
                  </div>
                )}

                {/* Tool calls display */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="w-full space-y-2">
                    {msg.toolCalls.map((tool, idx) => (
                      <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {tool.toolName === "webSearch" && "🔍 Web Search"}
                            {tool.toolName === "imageGeneration" && "🎨 Image Generated"}
                          </span>
                        </div>
                        {tool.toolName === "imageGeneration" && tool.result?.imageUrl && (
                          <img
                            src={tool.result.imageUrl}
                            alt={tool.args.prompt}
                            className="max-w-[400px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setFullScreenImage(tool.result.imageUrl)}
                            title="Click to view full screen"
                          />
                        )}
                        {tool.toolName === "webSearch" && tool.result?.results && (
                          <div className="text-xs space-y-1">
                            {tool.result.results.slice(0, 3).map((result: any, i: number) => (
                              <div key={i}>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {result.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons for assistant messages */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => handleRegenerateMessage(index)}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => copyToClipboard(msg.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {msg.feedback !== "dislike" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 cursor-pointer ${
                          msg.feedback === "like"
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => handleFeedback(msg._id, "like", msg.feedback)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    )}
                    {msg.feedback !== "like" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 cursor-pointer ${
                          msg.feedback === "dislike"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => handleFeedback(msg._id, "dislike", msg.feedback)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
                  <span className="text-xs font-medium">U</span>
                </div>
              )}
            </div>
          )})}

          {/* Loading indicator */}
          {isLoading && (() => {
            const modelInfo = AVAILABLE_MODELS[selectedModel];
            const providerIcon = modelInfo ? getProviderIcon(modelInfo.provider) : null;
            const ProviderIcon = providerIcon?.icon;

            return (
              <div className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${providerIcon?.bgColor || 'bg-muted'} flex items-center justify-center`}>
                  {ProviderIcon ? (
                    <ProviderIcon className={`h-4 w-4 ${providerIcon?.color || 'text-foreground'}`} />
                  ) : (
                    <Settings className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div className="bg-muted px-4 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            );
          })()}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 py-3">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="relative bg-card border dark:bg-input border-border">
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onToggleImageMode}
                  className="h-9 w-9 border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onToggleWebSearchMode}
                  className="h-9 w-9 border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/40 cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                {/* Desktop: Model selector next to dictate button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-sm font-medium hover:bg-accent cursor-pointer text-[#7c7c7c] h-10 px-3"
                    >
                      {models.find((m) => m.id === selectedModel)?.name || selectedModel}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="text-muted-foreground font-normal text-sm">
                      Select Model
                    </DropdownMenuLabel>
                    <div className="space-y-1">
                      {models.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          className="flex items-start gap-3 p-3 cursor-pointer rounded-lg"
                          onSelect={() => onModelChange(model.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{model.name}</p>
                              {model.isPro && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                  Pro
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

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
      </div>

      {/* Model Selector - Moved to header */}
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

      {/* Full screen image modal */}
      <Dialog open={!!fullScreenImage} onOpenChange={() => setFullScreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Generated Image</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={fullScreenImage || ""}
              alt="Full screen"
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

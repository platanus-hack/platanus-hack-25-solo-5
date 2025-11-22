"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Sparkles,
  Search,
  HelpCircle,
  Grid3x3,
  Crown,
  ChevronLeft,
  ImageIcon,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"
import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery, useConvexAuth, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface Thread {
  _id: Id<"threads">
  _creationTime: number
  title?: string
  modelId: string
  createdAt: number
  updatedAt: number
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onLoginClick: () => void
  onUpgradeClick: () => void
  onChatSelect: (threadId: Id<"threads">) => void
  onNewChat: () => void
  activeThreadId: Id<"threads"> | null
  threads?: Thread[]
}

export function Sidebar({
  isOpen,
  onToggle,
  onLoginClick,
  onUpgradeClick,
  onChatSelect,
  onNewChat,
  activeThreadId,
  threads: threadsProp,
}: SidebarProps) {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const { isAuthenticated } = useConvexAuth()

  // Load threads directly in Sidebar if not provided
  const threadsQuery = useQuery(api.chat.getThreads, isAuthenticated ? {} : "skip")
  const threads = threadsProp || threadsQuery || []

  // Get current user to check admin role
  const currentUser = useQuery(api.authUtils.getCurrentUser)
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin"

  // Get user subscription
  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    currentUser ? { userId: currentUser._id } : "skip"
  )

  // Check if user has active PRO plan
  const isPro =
    subscription &&
    (["active", "trialing"].includes(subscription.status) ||
      (subscription.status === "past_due" && Date.now() < subscription.currentPeriodEnd))

  // State for rename dialog
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean
    threadId: Id<"threads"> | null
    currentTitle: string
  }>({ isOpen: false, threadId: null, currentTitle: "" })

  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    threadId: Id<"threads"> | null
  }>({ isOpen: false, threadId: null })

  // Convex mutations
  const updateTitle = useMutation(api.chat.updateThreadTitle)
  const deleteThread = useMutation(api.chat.deleteThread)

  // Helper function to close sidebar on mobile after action
  const handleActionAndClose = (action: () => void) => {
    action()
    // Close sidebar on mobile (using a small delay to ensure smooth transition)
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setTimeout(() => onToggle(), 100)
    }
  }

  // Handler functions for context menu actions
  const handleRename = (thread: Thread) => {
    setRenameDialog({
      isOpen: true,
      threadId: thread._id,
      currentTitle: thread.title || "New Chat",
    })
  }

  const handleSaveRename = async () => {
    if (renameDialog.threadId && renameDialog.currentTitle.trim()) {
      try {
        await updateTitle({
          threadId: renameDialog.threadId,
          title: renameDialog.currentTitle.trim(),
        })
        setRenameDialog({ isOpen: false, threadId: null, currentTitle: "" })
      } catch (error) {
        console.error("Error renaming thread:", error)
      }
    }
  }

  const handleDelete = (thread: Thread) => {
    setDeleteDialog({
      isOpen: true,
      threadId: thread._id,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteDialog.threadId) {
      try {
        const isActiveThread = deleteDialog.threadId === activeThreadId

        if (isActiveThread) {
          onNewChat()
        }

        await deleteThread({ threadId: deleteDialog.threadId })
        setDeleteDialog({ isOpen: false, threadId: null })
      } catch (error) {
        console.error("Error deleting thread:", error)
      }
    }
  }

  // Get thread title or generate from first message
  const getThreadTitle = (thread: Thread) => {
    return thread.title || "New Chat"
  }

  // Render a thread item
  const renderThreadItem = (thread: Thread) => (
    <div
      key={thread._id}
      className={cn(
        "group flex items-start gap-2 px-2 py-2 hover:bg-accent cursor-pointer transition-colors",
        activeThreadId === thread._id && "bg-accent",
      )}
      onClick={() => handleActionAndClose(() => onChatSelect(thread._id))}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-foreground">{getThreadTitle(thread)}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => handleRename(thread)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(thread)} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-background lg:bg-muted/30 border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1
            className="text-lg font-semibold text-foreground cursor-pointer hover:text-foreground/80"
            onClick={onNewChat}
          >
            Chattia
          </h1>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3 space-y-1 border-b border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-background hover:bg-accent cursor-pointer"
              onClick={() => handleActionAndClose(onNewChat)}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>

            <div className="pt-2">
              <Link href="/my-tools" onClick={() => window.innerWidth < 1024 && onToggle()} className="cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Sparkles className="h-3 w-3" />
                  My Tools
                </div>
              </Link>
            </div>

            <Link href="/image-generator" onClick={() => window.innerWidth < 1024 && onToggle()} className="cursor-pointer">
              <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer">
                <ImageIcon className="h-4 w-4" />
                Image Generation
              </Button>
            </Link>

            <Link href="/search-engine" onClick={() => window.innerWidth < 1024 && onToggle()} className="cursor-pointer">
              <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer">
                <Search className="h-4 w-4" />
                AI Search Engine
              </Button>
            </Link>

            {/* Admin Panel - Only visible for admins */}
            {isAdmin && (
              <Link href="/admin" onClick={() => window.innerWidth < 1024 && onToggle()} className="cursor-pointer">
                <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer border-t border-border pt-2 mt-2">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>

          {/* Chat History with infinite scroll */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  No chats yet
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {threads.map(renderThreadItem)}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer"
            onClick={() => window.innerWidth < 1024 && onToggle()}
          >
            <HelpCircle className="h-4 w-4" />
            Help & FAQ
          </Button>

          <Link href="/explore-bots" onClick={() => window.innerWidth < 1024 && onToggle()} className="cursor-pointer">
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer">
              <Grid3x3 className="h-4 w-4" />
              Explore Tools
            </Button>
          </Link>

          {!isPro && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-foreground hover:bg-accent cursor-pointer"
              onClick={() => handleActionAndClose(isSignedIn ? onUpgradeClick : onLoginClick)}
            >
              <Crown className="h-4 w-4" />
              Go Pro
            </Button>
          )}

          {/* User Authentication Section */}
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-3 bg-background border border-border mt-2 w-full hover:bg-accent transition-colors cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback>
                      {user?.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user?.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {isPro ? (
                        <>
                          <Crown className="h-3 w-3 text-yellow-500" />
                          Pro User
                        </>
                      ) : (
                        "Free Plan"
                      )}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                className="w-full bg-foreground hover:bg-foreground/90 text-background mt-2 cursor-pointer"
                onClick={() => handleActionAndClose(onLoginClick)}
              >
                Login
              </Button>

              <Button
                variant="ghost"
                className="w-full text-foreground hover:bg-accent cursor-pointer"
                onClick={() => handleActionAndClose(() => router.push("/register"))}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.isOpen}
        onOpenChange={(open) => !open && setRenameDialog({ isOpen: false, threadId: null, currentTitle: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>Enter a new name for this chat conversation.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameDialog.currentTitle}
            onChange={(e) => setRenameDialog({ ...renameDialog, currentTitle: e.target.value })}
            placeholder="Enter chat name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveRename()
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ isOpen: false, threadId: null, currentTitle: "" })}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRename} disabled={!renameDialog.currentTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, threadId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

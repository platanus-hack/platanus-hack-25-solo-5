"use client"

import { Button } from "@/components/ui/button"
import { X, MoreVertical, MessageSquare, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface ChatsPanelProps {
  isOpen: boolean
  onClose: () => void
  onChatSelect: (threadId: Id<"threads">) => void
  onNewChat: () => void
  activeThreadId: Id<"threads"> | null
  threads: Thread[]
}

export function ChatsPanel({ isOpen, onClose, onChatSelect, onNewChat, activeThreadId, threads }: ChatsPanelProps) {
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

  if (!isOpen) return null

  // Helper function to handle chat selection and close on mobile
  const handleChatSelect = (threadId: Id<"threads">) => {
    onChatSelect(threadId)
    // Close panel on mobile after selection
    if (window.innerWidth < 1024) {
      setTimeout(() => onClose(), 100)
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

        if (isActiveThread) {
          onClose()
        }
      } catch (error) {
        console.error("Error deleting thread:", error)
      }
    }
  }

  // Get thread title
  const getThreadTitle = (thread: Thread) => {
    return thread.title || "New Chat"
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />

      <aside className="fixed lg:relative inset-y-0 left-0 lg:left-auto z-40 w-72 bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                No chats yet
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread._id}
                className={cn(
                  "group flex items-start gap-3 px-3 py-3 hover:bg-accent cursor-pointer transition-colors",
                  activeThreadId === thread._id && "bg-accent",
                )}
                onClick={() => handleChatSelect(thread._id)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">{getThreadTitle(thread)}</h3>
                  <p className="text-xs text-muted-foreground truncate">{thread.modelId}</p>
                </div>
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
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
            ))
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

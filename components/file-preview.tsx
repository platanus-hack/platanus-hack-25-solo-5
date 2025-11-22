"use client";

import { useState } from "react";
import { FileIcon, FileText, X, Download, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileAttachment {
  storageId: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
}

interface FilePreviewProps {
  attachments: FileAttachment[];
}

export function FilePreview({ attachments }: FilePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment, index) => {
          const isImage = attachment.mimeType.startsWith("image/");
          const isPdf = attachment.mimeType === "application/pdf";

          if (isImage && attachment.url) {
            return (
              <div
                key={index}
                className="relative group overflow-hidden border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedImage(attachment.url!)}
              >
                <img
                  src={attachment.url}
                  alt={attachment.filename}
                  className="h-24 w-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[10px] text-white truncate px-1">
                    {attachment.filename}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border bg-muted/50 hover:bg-muted transition-colors group max-w-xs"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-background">
                {isPdf ? (
                  <FileText className="h-5 w-5 text-red-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              {attachment.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(attachment.url!, attachment.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

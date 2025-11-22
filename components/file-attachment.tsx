"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { X, FileIcon, ImageIcon, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { extractTextFromDocument } from "@/lib/document-parser";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 5;

const ALLOWED_TYPES = {
  "image/jpeg": { icon: ImageIcon, label: "JPEG Image" },
  "image/jpg": { icon: ImageIcon, label: "JPG Image" },
  "image/png": { icon: ImageIcon, label: "PNG Image" },
  "image/gif": { icon: ImageIcon, label: "GIF Image" },
  "image/webp": { icon: ImageIcon, label: "WebP Image" },
  "application/pdf": { icon: FileText, label: "PDF Document" },
  "text/plain": { icon: FileText, label: "Text File" },
  "text/markdown": { icon: FileText, label: "Markdown File" },
  "text/csv": { icon: FileText, label: "CSV File" },
  "application/json": { icon: FileIcon, label: "JSON File" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, label: "Word Document" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: FileText, label: "Excel Spreadsheet" },
  "application/vnd.oasis.opendocument.presentation": { icon: FileText, label: "ODP Presentation" },
};

export interface FileAttachment {
  file: File;
  preview?: string;
  storageId?: string;
  uploading?: boolean;
  extractedText?: string;
  extracting?: boolean;
  wasTruncated?: boolean;
}

export interface FileAttachmentHandle {
  openFilePicker: () => void;
}

interface FileAttachmentProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
}

export const FileAttachmentInput = forwardRef<FileAttachmentHandle, FileAttachmentProps>(
  ({ files, onFilesChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    useImperativeHandle(ref, () => ({
      openFilePicker: () => {
        fileInputRef.current?.click();
      },
    }));

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);

      if (files.length + selectedFiles.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const newFiles: FileAttachment[] = [];

      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. Maximum size is 20MB`);
          continue;
        }

        if (!(file.type in ALLOWED_TYPES)) {
          toast.error(`${file.name} has unsupported file type`);
          continue;
        }

        const newFile: FileAttachment = {
          file,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          uploading: true,
        };

        newFiles.push(newFile);
      }

      onFilesChange([...files, ...newFiles]);

      for (const newFile of newFiles) {
        const isDocument = !newFile.file.type.startsWith("image/");

        if (isDocument) {
          try {
            onFilesChange((currentFiles) =>
              currentFiles.map((f) =>
                f.file === newFile.file ? { ...f, extracting: true } : f
              )
            );

            const { text, wasTruncated } = await extractTextFromDocument(newFile.file);

            if (wasTruncated) {
              toast.warning(`Documento truncado: ${newFile.file.name}`);
            }

            onFilesChange((currentFiles) =>
              currentFiles.map((f) =>
                f.file === newFile.file ? { ...f, extractedText: text, wasTruncated, extracting: false } : f
              )
            );
          } catch (error) {
            console.error("Error extracting text:", error);
            onFilesChange((currentFiles) =>
              currentFiles.map((f) =>
                f.file === newFile.file ? { ...f, extracting: false } : f
              )
            );
          }
        }

        try {
          setUploading(true);
          const uploadUrl = await generateUploadUrl();

          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": newFile.file.type },
            body: newFile.file,
          });

          const { storageId } = await result.json();

          onFilesChange((currentFiles) =>
            currentFiles.map((f) =>
              f.file === newFile.file ? { ...f, storageId, uploading: false } : f
            )
          );
        } catch (error) {
          toast.error(`Failed to upload ${newFile.file.name}`);
          onFilesChange((currentFiles) =>
            currentFiles.filter((f) => f.file !== newFile.file)
          );
        } finally {
          setUploading(false);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemoveFile = (index: number) => {
      const file = files[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      onFilesChange(files.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.keys(ALLOWED_TYPES).join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((fileAttachment, index) => {
              const fileType = fileAttachment.file.type as keyof typeof ALLOWED_TYPES;
              const typeInfo = ALLOWED_TYPES[fileType] || { icon: FileIcon, label: "File" };
              const Icon = typeInfo.icon;
              const isImage = fileAttachment.file.type.startsWith("image/");

              return (
                <div
                  key={index}
                  className="relative group flex items-center gap-2 px-2 py-1.5 rounded-lg bg-transparent hover:bg-muted/10 transition-colors"
                >
                  {(fileAttachment.uploading || fileAttachment.extracting) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {fileAttachment.extracting && (
                        <p className="text-xs text-muted-foreground mt-1">Extrayendo texto...</p>
                      )}
                    </div>
                  )}

                  <div className="relative flex-shrink-0">
                    {isImage && fileAttachment.preview ? (
                      <img
                        src={fileAttachment.preview}
                        alt={fileAttachment.file.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-red-500 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-accent"
                      onClick={() => handleRemoveFile(index)}
                      disabled={fileAttachment.uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {fileAttachment.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeInfo.label.toUpperCase()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }
);

FileAttachmentInput.displayName = "FileAttachmentInput";

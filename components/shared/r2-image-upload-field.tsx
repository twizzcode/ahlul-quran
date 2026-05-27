"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFileToR2 } from "@/lib/storage/upload-client";

type R2ImageUploadFieldProps = {
  label?: string;
  value: string;
  folder: string;
  onChange: (value: string) => void;
  deferUpload?: boolean;
  onPendingFileChange?: (file: File | null, previewUrl: string) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
  onError?: (message: string) => void;
  previewFrameClassName?: string;
  previewImageClassName?: string;
  emptyStateClassName?: string;
  naturalPreview?: boolean;
};

export function R2ImageUploadField({
  label,
  value,
  folder,
  onChange,
  deferUpload = false,
  onPendingFileChange,
  description,
  disabled = false,
  className,
  onError,
  previewFrameClassName,
  previewImageClassName,
  emptyStateClassName,
  naturalPreview = false,
}: R2ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const message = "File harus berupa gambar.";
      setErrorMessage(message);
      onError?.(message);
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      if (deferUpload) {
        const previewUrl = URL.createObjectURL(file);
        onPendingFileChange?.(file, previewUrl);
        onChange(previewUrl);
        return;
      }

      const nextUrl = await uploadFileToR2(file, folder);
      onChange(nextUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengupload gambar.";
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleUpload(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = event.dataTransfer.files?.[0] ?? null;
    void handleUpload(file);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label || description ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            {label ? (
              <label className="block text-sm font-medium">{label}</label>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl bg-muted/20 transition-colors",
          isDragging && "border-emerald-400 bg-emerald-50",
          disabled && "opacity-60",
        )}
      >
        {value ? (
          <div className="space-y-3">
            {naturalPreview ? (
              <div
                className={cn(
                  "overflow-hidden rounded-lg border bg-background p-3",
                  previewFrameClassName,
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={label || "Preview image"}
                  className={cn(
                    "mx-auto block h-auto max-h-[420px] w-auto max-w-full object-contain",
                    previewImageClassName,
                  )}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-lg border bg-background",
                  previewFrameClassName,
                )}
              >
                <Image
                  src={value}
                  alt={label || "Preview image"}
                  fill
                  className={cn("object-cover", previewImageClassName)}
                />
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Ganti Gambar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                disabled={disabled || isUploading}
                className="w-full"
              >
                <X className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 py-6 text-center",
              emptyStateClassName,
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              {isUploading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop gambar di sini
              </p>
              <p className="text-xs text-muted-foreground">
                atau pilih file untuk upload ke Cloudflare R2
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <Upload className="h-4 w-4" />
              Pilih Gambar
            </Button>
          </div>
        )}
      </div>

      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

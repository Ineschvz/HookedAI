"use client";

import { useState, useRef, useCallback } from "react";
import { validateImageFile } from "@/lib/validation";
import { uploadImage } from "@/lib/upload";
import type { UploadStatus, UploadResult } from "@/types/upload";

//props for the ImageUpload component, allowing the parent component to receive the upload results and handle them as needed
interface ImageUploadProps {
  //`prop?: Type`
  onUploadComplete?: (result: UploadResult) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);


//when drop zone is clicked, it triggers hidden file input to open file browser dialog
//grabs the element on DOM 
  const inputRef = useRef<HTMLInputElement>(null);

  /** Clean up the previous object URL to avoid memory leaks */
  const clearPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }, [preview]);

  const resetState = useCallback(() => {
    clearPreview();
    setFile(null);
    setStatus("idle");
    setError(null);
  }, [clearPreview]);

  /**
   * Central handler for both drop and file-input selection.
   * Validates the file, shows a preview, then uploads to Supabase.
   */
  const handleFile = useCallback(
    async (selectedFile: File) => {
      // -- Validate --
      setStatus("validating");
      setError(null);
      clearPreview();

      const validation = validateImageFile(selectedFile);
      if (!validation.valid) {
        setStatus("error");
        setError(validation.error ?? "Invalid file.");
        return;
      }

      // -- Preview --
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));

      // -- Upload --
      setStatus("uploading");
      try {
        const result = await uploadImage(selectedFile);
        setStatus("success");
        onUploadComplete?.(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        setStatus("error");
        setError(message);
      }
    },
    [clearPreview, onUploadComplete]
  );

  // ── Drag-and-drop handlers ──────────────────────────────────────────

  //  lets us track when a file is being dragged over the drop zone
  //(e: React.DragEvent) is the event type for drag events in react
  const handleDragOver = (e: React.DragEvent) => {
    // Prevent default to allow drop
    e.preventDefault();
    // This is necessary to allow a drop
    setIsDragging(true);
  };

  // When a file is dragged out of the drop zone, resets the dragging state to false
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // when file is dropped into the zone.
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
//variable droppedFile is assigned the first file from the list of files that were dropped. 
    const droppedFile = e.dataTransfer.files[0];
    //if there is a file it calls handlefile function to process the file (validate, preview, upload)
    if (droppedFile) handleFile(droppedFile);
  };

  // ── File input handler ──────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  // ── Helper: human-readable file size ────────────────────────────────

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Drop zone */}
      <button
        type="button"
        //controls the file input element, allowing users to click the drop zone to open the file browser dialog
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full rounded-xl border-2 border-dashed p-8 text-center
          transition-colors duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground/30
          ${
            isDragging
              ? "border-foreground/60 bg-foreground/5"
              : "border-foreground/20 hover:border-foreground/40"
          }
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-10 w-10 text-foreground/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        <p className="mt-3 text-sm font-medium text-foreground/80">
          {isDragging ? "Drop your image here" : "Drag & drop an image, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-foreground/50">JPG or PNG, up to 10 MB</p>
      </button>

      {/* Image preview */}
      {preview && file && (
        <div className="mt-4 rounded-xl border border-foreground/10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview, next/image doesn't support object URLs */}
          <img
            src={preview}
            alt={`Preview of ${file.name}`}
            className="w-full h-56 object-cover"
          />
          <div className="flex items-center justify-between px-4 py-3 bg-foreground/[0.02]">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-foreground/50">{formatSize(file.size)}</p>
            </div>

            {/* Status indicator */}
            {status === "uploading" && (
              <span className="text-xs text-foreground/60 flex items-center gap-1.5 shrink-0">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Uploading...
              </span>
            )}

            {status === "success" && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Uploaded
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error message + retry */}
      {status === "error" && error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 flex items-start gap-3">
          <svg
            className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <div className="min-w-0">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={resetState}
              className="mt-1 text-xs font-medium text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

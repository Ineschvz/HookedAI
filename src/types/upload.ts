export type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

export interface UploadResult {
  /** Storage path within the bucket */
  path: string;
  /** Publicly accessible URL for the uploaded image */
  publicUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

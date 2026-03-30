import type { ValidationResult } from "@/types/upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates an image file for type and size before uploading.
 * Only JPG and PNG files up to 10 MB are accepted.
 */
export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG and PNG files are supported.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum size is 10 MB.`,
    };
  }

  return { valid: true };
}

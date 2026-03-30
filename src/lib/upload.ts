import { supabase } from "@/lib/supabase";
import type { UploadResult } from "@/types/upload";

const BUCKET = "pattern-images";

/**
 * Uploads an image file to Supabase Storage.
 * Generates a unique filename to avoid collisions.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  // Prefix with a UUID so users can upload files with the same name
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

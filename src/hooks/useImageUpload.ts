import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (const [index, file] of files.entries()) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5 MB`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);
          uploadedUrls.push(urlData.publicUrl);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown upload error";
          console.error(`Upload error for ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}: ${message}`);
        }

        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }

      if (uploadedUrls.length) {
        toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? "image" : "images"} uploaded successfully`);
      }

      return uploadedUrls;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const [url] = await uploadImages([file]);
    return url || null;
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split("/property-images/");
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from("property-images")
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return {
    uploadImage,
    uploadImages,
    deleteImage,
    isUploading,
    uploadProgress,
  };
};

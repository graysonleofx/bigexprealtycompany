import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      setUploadProgress(100);
      toast.success("Image uploaded successfully");

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image: " + error.message);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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
    } catch (error: any) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
  };
};

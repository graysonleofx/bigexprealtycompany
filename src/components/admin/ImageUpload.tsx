import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Loader2, Link2, Star, Upload, X } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  className?: string;
}

const ImageUpload = ({ value, onChange, className }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImages, isUploading, uploadProgress } = useImageUpload();

  const handleFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);
    if (!selectedFiles.length || isUploading) return;

    const uploadedImages = await uploadImages(selectedFiles);
    if (uploadedImages.length) {
      onChange([...value, ...uploadedImages]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (!url) return;

    onChange([...value, url]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    onChange([value[index], ...value.filter((_, imageIndex) => imageIndex !== index)]);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="font-medium text-foreground">Uploading images</p>
              <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-foreground">Add property photos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag and drop images here, or select multiple files
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WEBP · up to 5 MB per image
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => void handleFiles(event.target.files || [])}
        className="hidden"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload images
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={isUploading}
        >
          <Link2 className="mr-2 h-4 w-4" />
          Add image URL
        </Button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/property.jpg"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            disabled={isUploading}
          />
          <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim() || isUploading}>
            Add
          </Button>
        </div>
      )}

      {value.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {value.length} {value.length === 1 ? "photo" : "photos"}
            </p>
            <p className="text-xs text-muted-foreground">First photo is the cover image</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((image, index) => (
              <div key={`${image}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={image}
                  alt={`Property photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    disabled={isUploading}
                    className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs font-medium text-foreground opacity-100 shadow-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Set photo ${index + 1} as cover`}
                  >
                    <Star className="h-3 w-3" />
                    Set cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

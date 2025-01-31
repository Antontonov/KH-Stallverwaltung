import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { apiRequest } from "@/lib/queryClient"; //Removed as per intention

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function ProfileImageUpload({
  currentImageUrl,
  onUploadComplete,
  className,
}: ProfileImageUploadProps) {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload fehlgeschlagen");
      }

      const data = await response.json();
      onUploadComplete(data.url);
      toast({ title: "Profilbild erfolgreich aktualisiert" });
    } catch (error) {
      toast({
        title: "Fehler beim Hochladen",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div className="aspect-square w-32 h-32 rounded-full overflow-hidden bg-background border">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Profilbild"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="secondary" size="sm">
            Bild ändern
          </Button>
        </label>
      </div>
    </div>
  );
}
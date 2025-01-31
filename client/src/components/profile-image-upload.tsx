import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
  className?: string;
}

type UploadResponse = {
  name: string;
  size: number;
  key: string;
  url: string;
};

export function ProfileImageUpload({
  currentImageUrl,
  onUploadComplete,
  className,
}: ProfileImageUploadProps) {
  const { toast } = useToast();

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
        <UploadButton
          endpoint="profileImage"
          onClientUploadComplete={(res: UploadResponse[]) => {
            if (res?.[0]) {
              onUploadComplete(res[0].url);
              toast({ title: "Profilbild erfolgreich aktualisiert" });
            }
          }}
          onUploadError={(error: Error) => {
            toast({
              title: "Fehler beim Hochladen",
              description: error.message,
              variant: "destructive",
            });
          }}
        />
      </div>
    </div>
  );
}
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { DocumentManager } from "@/components/document-manager";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profile_image_url: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profilbild erfolgreich aktualisiert" });
    },
  });

  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mein Profil</h1>
        <Link href="/profile/edit">
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex justify-center">
        <ProfileImageUpload
          currentImageUrl={user.profile_image_url}
          onUploadComplete={(url) =>
            updateProfileMutation.mutate({ profile_image_url: url })
          }
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Persönliche Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div>{user.first_name} {user.last_name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Benutzername</div>
            <div>{user.username}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Adresse</div>
            <div>{user.address}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bankverbindung</div>
            <div>{user.bank_account}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Geburtsdatum</div>
            <div>{format(new Date(user.birth_date), 'dd.MM.yyyy')}</div>
          </div>
        </CardContent>
      </Card>

      <DocumentManager entityType="user" entityId={user.id} />
    </div>
  );
}
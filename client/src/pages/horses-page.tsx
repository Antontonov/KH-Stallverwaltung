import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Plus, Edit } from "lucide-react";
import type { SelectHorse } from "@db/schema";
import { format } from "date-fns";
import { DocumentManager } from "@/components/document-manager";
import { ProfileImageUpload } from "@/components/profile-image-upload";

export default function HorsesPage() {
  const { toast } = useToast();
  const { data: horses } = useQuery<SelectHorse[]>({ queryKey: ["/api/horses"] });

  const createHorseMutation = useMutation({
    mutationFn: async (data: Partial<SelectHorse>) => {
      const res = await apiRequest("POST", "/api/horses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/horses"] });
      toast({ title: "Pferd erfolgreich erstellt" });
    },
  });

  const updateHorseMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SelectHorse> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/horses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/horses"] });
      toast({ title: "Pferd erfolgreich aktualisiert" });
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pferde</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Pferd hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Pferd hinzufügen</DialogTitle>
            </DialogHeader>
            <HorseForm onSubmit={(data) => createHorseMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Bild</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Alter</TableHead>
                <TableHead>Rasse</TableHead>
                <TableHead>Größe (cm)</TableHead>
                <TableHead>Nächster Tierarzttermin</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {horses?.map((horse) => (
                <TableRow key={horse.id}>
                  <TableCell>
                    <ProfileImageUpload
                      currentImageUrl={horse.profile_image_url}
                      onUploadComplete={(url) =>
                        updateHorseMutation.mutate({
                          id: horse.id,
                          profile_image_url: url,
                        })
                      }
                      className="w-24 h-24"
                    />
                  </TableCell>
                  <TableCell>{horse.name}</TableCell>
                  <TableCell>{horse.age}</TableCell>
                  <TableCell>{horse.breed}</TableCell>
                  <TableCell>{horse.height}</TableCell>
                  <TableCell>
                    {horse.next_vet_appointment
                      ? format(new Date(horse.next_vet_appointment), "dd.MM.yyyy")
                      : "Nicht geplant"}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pferd bearbeiten</DialogTitle>
                        </DialogHeader>
                        <HorseForm
                          horse={horse}
                          onSubmit={(data) =>
                            updateHorseMutation.mutate({ ...data, id: horse.id })
                          }
                        />
                        <DocumentManager
                          entityType="horse"
                          entityId={horse.id}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function HorseForm({
  horse,
  onSubmit,
}: {
  horse?: SelectHorse;
  onSubmit: (data: Partial<SelectHorse>) => void;
}) {
  const form = useForm<Partial<SelectHorse>>({
    defaultValues: {
      ...horse,
      next_vet_appointment: horse?.next_vet_appointment
        ? format(new Date(horse.next_vet_appointment), 'yyyy-MM-dd')
        : undefined
    },
  });

  const handleSubmit = (data: Partial<SelectHorse>) => {
    // Convert the date string to a proper Date object
    const formattedData = {
      ...data,
      next_vet_appointment: data.next_vet_appointment ? new Date(data.next_vet_appointment).toISOString() : null
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alter</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rasse</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Größe (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="next_vet_appointment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nächster Tierarzttermin</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {horse ? "Pferd aktualisieren" : "Pferd hinzufügen"}
        </Button>
      </form>
    </Form>
  );
}
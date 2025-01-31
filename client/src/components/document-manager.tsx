import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Upload, FileText, File } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import type { SelectDocument } from "@db/schema";

interface DocumentManagerProps {
  entityType: "user" | "horse";
  entityId: number;
}

export function DocumentManager({ entityType, entityId }: DocumentManagerProps) {
  const { toast } = useToast();
  const { data: documents } = useQuery<SelectDocument[]>({
    queryKey: [`/api/documents/${entityType}/${entityId}`],
  });

  const form = useForm<{ title: string; documentType: "invoice" | "other" }>();

  const handleFileUpload = async (file: File, formData: { title: string; documentType: string }) => {
    const uploadFormData = new FormData();
    uploadFormData.append("document", file);

    try {
      const uploadResponse = await fetch("/api/upload/document", {
        method: "POST",
        body: uploadFormData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload fehlgeschlagen");
      }

      const uploadData = await uploadResponse.json();

      // Create document record
      await createDocumentMutation.mutateAsync({
        title: formData.title,
        document_type: formData.documentType as "invoice" | "other",
        file_url: uploadData.url,
        entity_type: entityType,
        entity_id: entityId,
      });
    } catch (error) {
      throw error;
    }
  };

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Fehler beim Erstellen des Dokuments");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/documents/${entityType}/${entityId}`],
      });
      toast({ title: "Dokument erfolgreich hochgeladen" });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Hochladen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dokumente</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Dokument hochladen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Dokument hochladen</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dokumententyp</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Dokumententyp wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">Rechnung</SelectItem>
                          <SelectItem value="other">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = form.getValues();
                    try {
                      await handleFileUpload(file, formData);
                    } catch (error) {
                      toast({
                        title: "Fehler beim Hochladen",
                        description: (error as Error).message,
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center gap-2">
                {doc.document_type === "invoice" ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <File className="w-4 h-4" />
                )}
                <div>
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(doc.uploaded_at), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(doc.file_url, "_blank")}
              >
                Öffnen
              </Button>
            </div>
          ))}
          {documents?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Keine Dokumente vorhanden
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
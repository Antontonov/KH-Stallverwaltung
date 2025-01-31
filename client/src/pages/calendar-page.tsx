import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import type { SelectAppointment, SelectHorse } from "@db/schema";
import { format, parseISO } from "date-fns";

export default function CalendarPage() {
  const { toast } = useToast();
  const { data: appointments } = useQuery<SelectAppointment[]>({
    queryKey: ["/api/appointments"],
  });
  const { data: horses } = useQuery<SelectHorse[]>({ queryKey: ["/api/horses"] });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: Partial<SelectAppointment>) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Termin erfolgreich erstellt" });
    },
  });

  const groupedAppointments = appointments?.reduce((acc, appointment) => {
    const date = format(parseISO(appointment.start_time.toString()), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, SelectAppointment[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kalender</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Termin hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Termin</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              horses={horses || []}
              onSubmit={(data) => createAppointmentMutation.mutate(data)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Termine</h2>
            <div className="space-y-4">
              {appointments?.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {format(parseISO(appointment.start_time.toString()), "PP p")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          bis {format(parseISO(appointment.end_time.toString()), "p")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AppointmentForm({
  horses,
  onSubmit,
}: {
  horses: SelectHorse[];
  onSubmit: (data: Partial<SelectAppointment>) => void;
}) {
  const form = useForm<Partial<SelectAppointment>>();

  const handleSubmit = (data: Partial<SelectAppointment>) => {
    const formattedData = {
      ...data,
      start_time: data.start_time ? new Date(data.start_time).toISOString() : undefined,
      end_time: data.end_time ? new Date(data.end_time).toISOString() : undefined,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="horse_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pferd</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pferd auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horses.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id.toString()}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startzeit</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endzeit</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Termin erstellen
        </Button>
      </form>
    </Form>
  );
}
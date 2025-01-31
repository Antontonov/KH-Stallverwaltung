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
      toast({ title: "Appointment created successfully" });
    },
  });

  const groupedAppointments = appointments?.reduce((acc, appointment) => {
    const date = format(parseISO(appointment.startTime.toString()), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, SelectAppointment[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
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
            <h2 className="text-xl font-semibold mb-4">Appointments</h2>
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
                          {format(parseISO(appointment.startTime.toString()), "PP p")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {format(parseISO(appointment.endTime.toString()), "p")}
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
      startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
      endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
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
              <FormLabel>Title</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="horseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horse</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a horse" />
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
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
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
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
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
          Create Appointment
        </Button>
      </form>
    </Form>
  );
}
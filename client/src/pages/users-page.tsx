import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, UserCog } from "lucide-react";
import type { SelectUser } from "@db/schema";
import { format } from "date-fns";

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: users } = useQuery<SelectUser[]>({ queryKey: ["/api/users"] });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SelectUser> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Benutzer erfolgreich aktualisiert" });
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Benutzer</h1>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Benutzername</TableHead>
                <TableHead className="hidden md:table-cell">Adresse</TableHead>
                <TableHead className="hidden md:table-cell">Geburtsdatum</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.address}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(user.birth_date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    {currentUser?.role_id === 1 ? (
                      <Select
                        defaultValue={user.role_id?.toString()}
                        onValueChange={(value) =>
                          updateUserMutation.mutate({
                            id: user.id,
                            role_id: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-24 md:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Admin</SelectItem>
                          <SelectItem value="2">Mitarbeiter</SelectItem>
                          <SelectItem value="3">Kunde</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>
                        {user.role_id === 1
                          ? "Admin"
                          : user.role_id === 2
                          ? "Mitarbeiter"
                          : "Kunde"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Benutzer bearbeiten</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Benutzerdetails</h3>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium">Name:</span>{" "}
                                {user.first_name} {user.last_name}
                              </div>
                              <div>
                                <span className="font-medium">Benutzername:</span>{" "}
                                {user.username}
                              </div>
                              <div>
                                <span className="font-medium">Adresse:</span>{" "}
                                {user.address}
                              </div>
                              <div>
                                <span className="font-medium">Bankverbindung:</span>{" "}
                                {user.bank_account}
                              </div>
                            </div>
                          </div>
                        </div>
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
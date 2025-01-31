import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      toast({ title: "User updated successfully" });
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>
                    {format(new Date(user.birthDate), "PP")}
                  </TableCell>
                  <TableCell>
                    {currentUser?.roleId === 1 ? ( // Admin role
                      <Select
                        defaultValue={user.roleId?.toString()}
                        onValueChange={(value) =>
                          updateUserMutation.mutate({
                            id: user.id,
                            roleId: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Admin</SelectItem>
                          <SelectItem value="2">Staff</SelectItem>
                          <SelectItem value="3">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>
                        {user.roleId === 1
                          ? "Admin"
                          : user.roleId === 2
                          ? "Staff"
                          : "Customer"}
                      </span>
                    )}
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
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">User Details</h3>
                            <div className="space-y-1">
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {user.firstName} {user.lastName}
                              </p>
                              <p>
                                <span className="font-medium">Username:</span>{" "}
                                {user.username}
                              </p>
                              <p>
                                <span className="font-medium">Address:</span>{" "}
                                {user.address}
                              </p>
                              <p>
                                <span className="font-medium">Bank Account:</span>{" "}
                                {user.bankAccount}
                              </p>
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

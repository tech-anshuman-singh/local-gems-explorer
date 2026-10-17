import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const roleStyle: Record<string, string> = {
  admin:     "bg-primary/10 text-primary",
  moderator: "bg-blue-100 text-blue-700",
  user:      "bg-muted text-muted-foreground",
};

const AdminUsers = () => {
  const { token, user: me } = useAuth();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users", token!),
    enabled: !!token,
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Manage Users</h1>
      <p className="text-muted-foreground">View and manage user accounts and roles</p>

      <div className="mt-6 rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Places</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No users found</TableCell></TableRow>
              ) : users.map((u: any) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {(u.display_name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.display_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={u.role}
                      onValueChange={(role) => updateRole.mutate({ id: u._id, role })}
                      disabled={u._id === me?._id}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{u.placeCount ?? 0}</TableCell>
                  <TableCell>{u.reviewCount ?? 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      disabled={u._id === me?._id}
                      title="Delete user"
                      onClick={() => { if (confirm(`Delete ${u.display_name || u.email}?`)) deleteUser.mutate(u._id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

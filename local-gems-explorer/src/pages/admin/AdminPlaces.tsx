import { useState } from "react";
import { Check, X, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  approved: "bg-primary/10 text-primary",
  pending:  "bg-orange-100 text-orange-700",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminPlaces = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: places = [], isLoading } = useQuery({
    queryKey: ["admin-places", statusFilter],
    queryFn: () => {
      const q = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      return api.get(`/admin/places${q}`, token!);
    },
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/places/${id}/status`, { status }, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-places"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePlace = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/places/${id}`, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-places"] }); toast.success("Place deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Places</h1>
          <p className="text-muted-foreground">Approve, reject, or remove place submissions</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No places found</TableCell></TableRow>
              ) : places.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium max-w-[180px] truncate">{p.title}</TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell>{p.city}, {p.country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.submitted_by?.display_name || "—"}</TableCell>
                  <TableCell>{p.reviewCount ?? 0}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {p.status !== "approved" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Approve"
                          onClick={() => updateStatus.mutate({ id: p._id, status: "approved" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {p.status !== "rejected" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" title="Reject"
                          onClick={() => updateStatus.mutate({ id: p._id, status: "rejected" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {p.status === "rejected" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Set Pending"
                          onClick={() => updateStatus.mutate({ id: p._id, status: "pending" })}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete"
                        onClick={() => { if (confirm("Delete this place?")) deletePlace.mutate(p._id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default AdminPlaces;
